import os
import sys
import datetime
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import app
from database import SessionLocal
from models.user import User
from models.skill import Skill
from models.task import Task
from models.task_instance import TaskInstance
from auth.jwt import create_access_token

client = TestClient(app)

def test_full_flow():
    db = SessionLocal()
    # 1. Check admin user
    admin = db.query(User).filter(User.username == "quest_hero").first()
    if not admin:
        admin = db.query(User).filter(User.role == "admin").first()
    assert admin is not None, "Admin user must exist"
    admin_id = admin.id
    admin_token = create_access_token(data={"sub": str(admin_id)})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    db.close()

    print(f"[TEST 1] Admin Authentication for '{admin.username}'...")
    res = client.get("/api/auth/me", headers=admin_headers)
    assert res.status_code == 200
    user_me = res.json()
    assert user_me["role"] == "admin"
    print(f" -> Authenticated as admin (Level {user_me['level']}, Total XP: {user_me['total_xp']})")

    # 2. Test Admin Stats
    print("[TEST 2] Testing /api/admin/stats...")
    res = client.get("/api/admin/stats", headers=admin_headers)
    assert res.status_code == 200
    stats = res.json()
    print(" -> Admin Stats Telemetry:", stats)
    assert stats["total_users"] >= 1
    assert "total_skills_created" in stats
    assert "total_productive_hours" in stats

    # 3. Test Admin User List & Search
    print("[TEST 3] Testing /api/admin/users...")
    res = client.get(f"/api/admin/users?search={admin.username}", headers=admin_headers)
    assert res.status_code == 200
    search_res = res.json()
    assert any(u["username"] == admin.username for u in search_res["users"])
    print(f" -> Found {len(search_res['users'])} user(s) matching search")

    # 4. Test Custom Skills: Add a custom skill
    print("[TEST 4] Creating custom skill: 'AI & Data Science'...")
    res = client.post("/api/skills", headers=admin_headers, json={
        "name": "AI & Data Science",
        "description": "Neural nets, LLM agents, and PyTorch",
        "icon": "brain",
        "color": "#8B5CF6"
    })
    assert res.status_code == 200
    skill_data = res.json()
    custom_skill_id = skill_data["skill_id"]
    print(f" -> Created Skill #{custom_skill_id}: {skill_data['name']}")

    # 5. Check Radar contains new skill
    res = client.get("/api/skills/radar", headers=admin_headers)
    assert res.status_code == 200
    radar = res.json()
    active_names = [r["skill"] for r in radar]
    print(f" -> Dynamic Radar Active Skills ({len(radar)} vertices): {active_names}")
    assert "AI & Data Science" in active_names

    # 6. Test Task -> Skill Connection
    print("[TEST 5] Creating Quest aligned with 'AI & Data Science'...")
    today = datetime.date.today().isoformat()
    res = client.post("/api/tasks", headers=admin_headers, json={
        "title": "Train Transformer Model",
        "description": "Fine-tune local LLM on custom dataset",
        "skill_id": custom_skill_id,
        "priority": "HIGH",
        "estimated_duration": 45,
        "recurrence": "DAILY",
        "xp_reward": 50
    })
    assert res.status_code == 200
    task_res = res.json()
    task_id = task_res["id"]
    print(f" -> Created Quest #{task_id}: '{task_res['title']}' linked to skill #{task_res['skill_id']}")
    assert task_res["skill_id"] == custom_skill_id

    # 7. Complete today's instance of this task
    print("[TEST 6] Completing Quest Instance and verifying XP award...")
    res = client.get("/api/instances/today", headers=admin_headers)
    assert res.status_code == 200
    today_instances = res.json()
    target_inst = next((i for i in today_instances if i["task_id"] == task_id), None)
    assert target_inst is not None, "Task instance should exist for today"

    res = client.post(f"/api/instances/{target_inst['id']}/complete", headers=admin_headers)
    assert res.status_code == 200
    comp_res = res.json()
    print(f" -> Completion result: +{comp_res['xp_earned']} XP awarded! Skill: {comp_res.get('skill_name')}, Level: {comp_res.get('skill_new_level')}")

    # 8. Verify skill XP increased
    res = client.get("/api/skills/detail", headers=admin_headers)
    assert res.status_code == 200
    detail = res.json()
    ai_skill = next((s for s in detail if s["skill_id"] == custom_skill_id), None)
    assert ai_skill is not None
    print(f" -> Skill '{ai_skill['name']}' now has {ai_skill['xp']} XP (Level {ai_skill['level']})")
    assert ai_skill["xp"] >= 50, f"Expected at least 50 XP, got {ai_skill['xp']}"

    # 9. Test Toggle Active/Inactive
    print("[TEST 7] Testing Deactivating and Reactivating skill...")
    res = client.post(f"/api/skills/{custom_skill_id}/toggle", headers=admin_headers)
    assert res.status_code == 200
    toggled = res.json()
    assert toggled["is_active"] == False

    res = client.get("/api/skills/radar", headers=admin_headers)
    radar_after_deact = res.json()
    assert not any(r["skill_id"] == custom_skill_id for r in radar_after_deact)
    print(f" -> Verified: Skill #{custom_skill_id} excluded from active radar polygon ({len(radar_after_deact)} skills now)")

    # 10. Clean up: Delete task and test skill deletion data preservation
    print("[TEST 8] Deleting custom skill and verifying historical data preservation...")
    res = client.delete(f"/api/skills/{custom_skill_id}", headers=admin_headers)
    assert res.status_code == 200

    # Verify task still exists and its past completed instance XP is untouched!
    db = SessionLocal()
    completed_inst = db.query(TaskInstance).filter(TaskInstance.id == target_inst["id"]).first()
    assert completed_inst is not None
    assert completed_inst.xp_awarded == 50
    assert completed_inst.status == "COMPLETED"
    print(f" -> Historical data integrity verified: TaskInstance #{completed_inst.id} retained xp_awarded={completed_inst.xp_awarded} and status={completed_inst.status}!")
    db.close()

    print("\nALL END-TO-END FLOW TESTS COMPLETED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_full_flow()
