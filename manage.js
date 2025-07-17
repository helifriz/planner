function addPilot() {
  const name = document.getElementById('pilotName').value.trim();
  const weight = parseFloat(document.getElementById('pilotWeight').value);
  if (!name || isNaN(weight)) {
    alert('Please enter a name and weight');
    return;
  }
  const pilots = JSON.parse(localStorage.getItem('PILOTS_EXTRA') || '[]');
  pilots.push({ name, weight });
  localStorage.setItem('PILOTS_EXTRA', JSON.stringify(pilots));
  document.getElementById('pilotName').value = '';
  document.getElementById('pilotWeight').value = '';
  alert('Pilot saved');
}

function addMedic() {
  const name = document.getElementById('medicName').value.trim();
  const weight = parseFloat(document.getElementById('medicWeight').value);
  if (!name || isNaN(weight)) {
    alert('Please enter a name and weight');
    return;
  }
  const medics = JSON.parse(localStorage.getItem('MEDICS_EXTRA') || '[]');
  medics.push({ name, weight });
  localStorage.setItem('MEDICS_EXTRA', JSON.stringify(medics));
  document.getElementById('medicName').value = '';
  document.getElementById('medicWeight').value = '';
  alert('Medic saved');
}

function addWaypoint() {
  const code = document.getElementById('waypointCode').value.trim();
  const name = document.getElementById('waypointName').value.trim();
  const regionText = document.getElementById('waypointRegion').value.trim();
  const lat = parseFloat(document.getElementById('waypointLat').value);
  const lon = parseFloat(document.getElementById('waypointLon').value);
  if (!code || !name || !regionText || isNaN(lat) || isNaN(lon)) {
    alert('Please fill out all waypoint fields');
    return;
  }
  const regions = regionText.split(',').map(r => r.trim());
  const wpts = JSON.parse(localStorage.getItem('WAYPOINTS_EXTRA') || '[]');
  wpts.push({ code, name, regions, lat, lon });
  localStorage.setItem('WAYPOINTS_EXTRA', JSON.stringify(wpts));
  document.getElementById('waypointCode').value = '';
  document.getElementById('waypointName').value = '';
  document.getElementById('waypointRegion').value = '';
  document.getElementById('waypointLat').value = '';
  document.getElementById('waypointLon').value = '';
  alert('Waypoint saved');
}
