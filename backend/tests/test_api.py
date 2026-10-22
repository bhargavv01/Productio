def log(client, category_id, start, end, title="entry"):
    return client.post("/log-entries/", json={
        "category_id": category_id, "title": title, "start_time": start, "end_time": end,
    })


def day_report(client, day):
    report = client.get("/reports/day", params={"date": day}).json()
    return report["total_minutes"], {c["name"]: c["minutes"] for c in report["categories"]}


# ---------- log entries ----------

def test_rejects_end_before_start(client, cat_ids):
    r = log(client, cat_ids["Work"], "2026-10-22T10:00:00", "2026-10-22T09:00:00")
    assert r.status_code == 422
    assert "end_time must be after start_time" in r.text


def test_rejects_overlapping_entries(client, cat_ids):
    assert log(client, cat_ids["Work"], "2026-10-22T09:00:00", "2026-10-22T11:00:00", "Deep work").status_code == 201
    r = log(client, cat_ids["Entertainment"], "2026-10-22T10:30:00", "2026-10-22T12:00:00")
    assert r.status_code == 409
    assert "Deep work" in r.json()["detail"]
    # touching boundaries is fine
    assert log(client, cat_ids["Entertainment"], "2026-10-22T11:00:00", "2026-10-22T12:00:00").status_code == 201


def test_update_checks_order_and_overlap(client, cat_ids):
    a = log(client, cat_ids["Work"], "2026-10-22T09:00:00", "2026-10-22T10:00:00").json()
    log(client, cat_ids["Study"], "2026-10-22T10:00:00", "2026-10-22T11:00:00")

    r = client.put(f"/log-entries/{a['id']}", json={"end_time": "2026-10-22T08:00:00"})
    assert r.status_code == 422
    r = client.put(f"/log-entries/{a['id']}", json={"end_time": "2026-10-22T10:30:00"})
    assert r.status_code == 409
    # moving an entry within its own slot does not clash with itself
    r = client.put(f"/log-entries/{a['id']}", json={"start_time": "2026-10-22T09:15:00"})
    assert r.status_code == 200
    # explicit null on a required field is ignored rather than crashing
    r = client.put(f"/log-entries/{a['id']}", json={"title": None, "note": None})
    assert r.status_code == 200 and r.json()["title"] == "entry"


def test_unknown_category_is_422_not_500(client):
    r = log(client, 999, "2026-10-22T09:00:00", "2026-10-22T10:00:00")
    assert r.status_code == 422
    assert "Category 999 does not exist" in r.json()["detail"]


def test_local_times_round_trip_unchanged(client, cat_ids):
    r = log(client, cat_ids["Work"], "2026-10-22T10:00:00", "2026-10-22T11:00:00")
    assert r.json()["start_time"] == "2026-10-22T10:00:00"


# ---------- midnight ----------

def test_entry_across_midnight_is_split_between_days(client, cat_ids):
    log(client, cat_ids["Study"], "2026-10-22T23:00:00", "2026-10-23T03:00:00")
    assert day_report(client, "2026-10-22") == (60.0, {"Study": 60.0})
    assert day_report(client, "2026-10-23") == (180.0, {"Study": 180.0})

    listed = client.get("/log-entries/", params={"date": "2026-10-23"}).json()
    assert [e["title"] for e in listed] == ["entry"]


def test_week_report_totals(client, cat_ids):
    log(client, cat_ids["Work"], "2026-10-19T09:00:00", "2026-10-19T12:00:00")
    log(client, cat_ids["Entertainment"], "2026-10-25T23:00:00", "2026-10-26T01:00:00")
    report = client.get("/reports/week", params={"start": "2026-10-19"}).json()
    totals = [d["total_minutes"] for d in report["days"]]
    assert totals == [180.0, 0, 0, 0, 0, 0, 60.0]  # the part after Sunday midnight is next week


def test_month_report_has_every_day(client):
    report = client.get("/reports/month", params={"year": 2026, "month": 2}).json()
    assert len(report["days"]) == 28


# ---------- planned blocks ----------

def test_planned_block_validation(client, cat_ids):
    base = {"date": "2026-10-22", "category_id": cat_ids["Work"], "title": "Plan"}
    r = client.post("/planned-blocks/", json={**base, "start_time": "10:00:00", "end_time": "09:00:00"})
    assert r.status_code == 422
    r = client.post("/planned-blocks/", json={**base, "title": "", "start_time": "09:00:00", "end_time": "10:00:00"})
    assert r.status_code == 422
    ok = client.post("/planned-blocks/", json={**base, "start_time": "09:00:00", "end_time": "10:00:00"})
    assert ok.status_code == 201
    r = client.put(f"/planned-blocks/{ok.json()['id']}", json={"start_time": "11:00:00"})
    assert r.status_code == 422


# ---------- goals ----------

def test_goal_validation(client, cat_ids):
    work = cat_ids["Work"]
    assert client.post("/goals/", json={"category_id": work, "target_minutes": -50, "period": "daily"}).status_code == 422
    assert client.post("/goals/", json={"category_id": work, "target_minutes": 2000, "period": "daily"}).status_code == 422
    goal = client.post("/goals/", json={"category_id": work, "target_minutes": 2000, "period": "weekly"})
    assert goal.status_code == 201
    # switching a 2000-minute weekly goal to daily would not fit in a day
    assert client.put(f"/goals/{goal.json()['id']}", json={"period": "daily"}).status_code == 422


# ---------- categories ----------

def test_category_validation_and_duplicates(client):
    assert client.post("/categories/", json={"name": "Work", "color": "#000000", "label": "productive"}).status_code == 409
    assert client.post("/categories/", json={"name": "Reading", "color": "blue", "label": "productive"}).status_code == 422
    assert client.post("/categories/", json={"name": "Reading", "color": "#112233", "label": "productive"}).status_code == 201


def test_category_with_history_cannot_be_deleted(client, cat_ids):
    log(client, cat_ids["Work"], "2026-10-22T09:00:00", "2026-10-22T10:00:00")
    r = client.delete(f"/categories/{cat_ids['Work']}")
    assert r.status_code == 409
    assert len(client.get("/log-entries/").json()) == 1
    # a category without log entries can still be deleted
    assert client.delete(f"/categories/{cat_ids['Chores']}").status_code == 204
