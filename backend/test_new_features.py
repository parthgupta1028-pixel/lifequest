import os
import sys
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from main import app
from database import SessionLocal
from models.user import User

client = TestClient(app)

def test_features():
    print("--- 1. Testing Admin Login & Roles ---")
    db = SessionLocal()
    # Find admin user
    admin_user = db.query(User).filter(User.role == "admin").first()
    print(f"Found admin user: {admin_user.username} (id: {admin_user.id}, role: {admin_user.role})")
    db.close()

    # Generate token for admin
    from auth.jwt import create_access_token
    token = create_access_token(data={"sub": str(admin_user.id)})
    headers = {"Authorization": f"Bearer {token}"}

    # Test /api/auth/me
    res = client.get("/api/auth/me", headers=headers)
    assert res.status_code == 200, res.text
    me_data = res.json()
    print(f"Auth /me role: {me_data.get('role')}, is_active: {me_data.get('is_active')}")
    assert me_data.get("role") == "admin"

    # Test /api/admin/stats
    print("--- 2. Testing /api/admin/stats ---")
    res = client.get("/api/admin/stats", headers=headers)
    assert res.status_code == 200, res.text
    stats = res.json()
    print("Admin stats:", stats)
    assert "total_users" in stats
    assert "total_tasks" in stats
    assert stats["total_users"] >= 1

    # Test /api/admin/users
    print("--- 3. Testing /api/admin/users ---")
    res = client.get("/api/admin/users?limit=10", headers=headers)
    assert res.status_code == 200, res.text
    users_data = res.json()
    print(f"Admin users count: {users_data['total']}, returned: {len(users_data['users'])}")
    assert len(users_data["users"]) > 0

    # Test Skills endpoints
    print("--- 4. Testing Custom Skills CRUD ---")
    # Radar before
    res = client.get("/api/skills/radar", headers=headers)
    assert res.status_code == 200
    radar_before = res.json()
    print(f"Active skills before: {len(radar_before)}")

    # Create new skill
    res = client.post("/api/skills", headers=headers, json={
        "name": "Machine Learning",
        "description": "Deep learning, neural nets and math",
        "icon": "brain",
        "color": "#06b6d4"
    })
    assert res.status_code == 200, res.text
    new_skill = res.json()
    new_skill_id = new_skill["skill_id"]
    print(f"Created custom skill: id={new_skill_id}, name={new_skill['name']}")

    # Radar after create
    res = client.get("/api/skills/radar", headers=headers)
    radar_after = res.json()
    print(f"Active skills after adding: {len(radar_after)}")
    assert any(item["skill"] == "Machine Learning" for item in radar_after)

    # Toggle skill inactive
    print("--- 5. Testing Skill Toggle Active/Inactive ---")
    res = client.post(f"/api/skills/{new_skill_id}/toggle", headers=headers)
    assert res.status_code == 200
    toggled = res.json()
    assert toggled["is_active"] == False

    # Radar after toggle (should be excluded)
    res = client.get("/api/skills/radar", headers=headers)
    radar_toggled = res.json()
    assert not any(item["skill"] == "Machine Learning" for item in radar_toggled)
    print("Verified: Inactive skill excluded from radar!")

    # Delete custom skill
    print("--- 6. Testing Skill Delete ---")
    res = client.delete(f"/api/skills/{new_skill_id}", headers=headers)
    assert res.status_code == 200
    print("Deleted custom skill successfully.")

    # Non-admin forbidden test
    print("--- 7. Testing Admin RBAC Security ---")
    db = SessionLocal()
    regular_user = db.query(User).filter(User.role == "user").first()
    db.close()
    if regular_user:
        reg_token = create_access_token(data={"sub": str(regular_user.id)})
        reg_headers = {"Authorization": f"Bearer {reg_token}"}
        res = client.get("/api/admin/stats", headers=reg_headers)
        assert res.status_code == 403, f"Expected 403, got {res.status_code}"
        print("Verified: Regular user receives 403 Forbidden on admin routes!")

    print("\nALL BACKEND TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_features()
