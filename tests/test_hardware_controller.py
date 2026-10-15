from fastapi.testclient import TestClient
import pytest
from backend.main import app
from backend.engine.hardware_controller import (
    parse_neptune_apex_xml,
    parse_neptune_apex_json,
    map_probes_to_raw_entry
)

client = TestClient(app)

SAMPLE_APEX_XML = """
<status software="5.06_3B21" hardware="1.0">
  <probes>
    <probe>
      <name>Tmp</name>
      <value>78.2</value>
      <type>Temp</type>
    </probe>
    <probe>
      <name>pH</name>
      <value>8.28</value>
      <type>pH</type>
    </probe>
    <probe>
      <name>Cond</name>
      <value>35.0</value>
      <type>Salinity</type>
    </probe>
    <probe>
      <name>Alk</name>
      <value>8.45</value>
      <type>dKH</type>
    </probe>
    <probe>
      <name>Ca</name>
      <value>430.0</value>
      <type>ppm</type>
    </probe>
    <probe>
      <name>Mg</name>
      <value>1365.0</value>
      <type>ppm</type>
    </probe>
  </probes>
</status>
"""

SAMPLE_APEX_JSON = {
    "inputs": [
        {"name": "Tmp", "value": 78.4, "type": "Temp"},
        {"name": "pH", "value": 8.26, "type": "pH"},
        {"name": "Cond", "value": 35.1, "type": "Salinity"},
        {"name": "Alk", "value": 8.35, "type": "dKH"},
        {"name": "Ca", "value": 425.0, "type": "ppm"},
        {"name": "Mg", "value": 1350.0, "type": "ppm"},
        {"name": "NO3", "value": 4.8, "type": "ppm"},
        {"name": "PO4", "value": 0.04, "type": "ppm"}
    ]
}


def test_parse_neptune_apex_xml():
    probes = parse_neptune_apex_xml(SAMPLE_APEX_XML)
    assert probes["Tmp"] == 78.2
    assert probes["pH"] == 8.28
    assert probes["Alk"] == 8.45
    assert probes["Ca"] == 430.0
    assert probes["Mg"] == 1365.0


def test_parse_neptune_apex_json():
    probes = parse_neptune_apex_json(SAMPLE_APEX_JSON)
    assert probes["Tmp"] == 78.4
    assert probes["pH"] == 8.26
    assert probes["Alk"] == 8.35
    assert probes["Ca"] == 425.0
    assert probes["NO3"] == 4.8


def test_map_probes_to_raw_entry():
    probes = {"Tmp": 78.5, "pH": 8.25, "Cond": 35.0, "Alk": 8.4, "Ca": 420.0, "Mg": 1350.0}
    raw = map_probes_to_raw_entry(probes, "2026-10-15T00:00:00Z")
    assert raw.alkalinity_value == 8.4
    assert raw.temperature_value == 78.5
    assert raw.temperature_unit == "f"
    assert raw.salinity_value == 35.0
    assert raw.salinity_unit == "ppt"


def test_hardware_poll_endpoint():
    resp = client.post("/api/hardware/poll", json={
        "controller_type": "neptune_apex",
        "host": "apex.local",
        "port": 80
    })
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ["connected", "simulated_sandbox"]
    assert "normalized_telemetry" in data
    assert data["normalized_telemetry"]["alkalinity_dkh"] > 0


def test_hardware_ingest_webhook():
    resp = client.post("/api/hardware/ingest", json={
        "temp": 78.0,
        "ph": 8.22,
        "alk": 8.3,
        "ca": 420.0,
        "mg": 1340.0,
        "nitrate": 5.0,
        "phosphate": 0.04
    })
    assert resp.status_code == 200
    entry = resp.json()
    assert entry["alkalinity_dkh"] == 8.3
    assert entry["calcium_ppm"] == 420.0
    assert entry["ph"] == 8.22
