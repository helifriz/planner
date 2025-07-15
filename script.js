let latestLegWeights = [];
let latestWeightTable = "";

function populateHelicopterDropdown() {
  const heliSelect = document.getElementById("helicopter");
  heliSelect.innerHTML = "";

  // Add placeholder
  const placeholder = new Option("Select Helicopter", "");
  heliSelect.add(placeholder);

  // Add helicopters by reg only (no weight shown)
  HELICOPTERS.forEach((heli) => {
    const option = new Option(heli.reg, heli.reg);
    heliSelect.add(option);
  });
}
function populatePilotDropdowns() {
  document.getElementById("leftPilot").value = "";
  document.getElementById("rightPilot").value = "";
}

function populateMedicDropdowns() {
  ["seat1a", "seat2a", "seat1c"].forEach((id) => {
    const select = document.getElementById(id);
    if (!select) return;
    select.innerHTML = "";
    const placeholder = new Option("Select Medic", "");
    select.add(placeholder);
    MEDICS.forEach((medic) => {
      const opt = new Option(medic.name, medic.name);
      select.add(opt);
    });
  });
}
function disableDuplicateMedic() {
  const ids = ["seat1a", "seat2a", "seat1c"];
  const allowMulti = ["Std Male", "Std Female"];
  const selected = {};
  ids.forEach((id) => {
    selected[id] = document.getElementById(id).value;
  });
  // Re-enable everything first
  ids.forEach((id) => {
    document.querySelectorAll(`#${id} option`).forEach((opt) => {
      opt.disabled = false;
    });
  });
  // Disable duplicate names except for standard entries
  ids.forEach((id) => {
    const val = selected[id];
    if (val && !allowMulti.includes(val)) {
      ids.forEach((otherId) => {
        if (otherId !== id) {
          document.querySelectorAll(`#${otherId} option`).forEach((opt) => {
            if (opt.value === val && opt.value !== "") {
              opt.disabled = true;
            }
          });
        }
      });
    }
  });
}
function disableDuplicatePilot(e) {
  const leftInput = document.getElementById("leftPilot");
  const rightInput = document.getElementById("rightPilot");
  if (leftInput.value && rightInput.value && leftInput.value === rightInput.value) {
    alert("Left and right pilots cannot be the same");
    if (e && e.target === leftInput) {
      leftInput.value = "";
    } else if (e && e.target === rightInput) {
      rightInput.value = "";
    }
  }
}

function setupPilotSearch(id) {
  const input = document.getElementById(id);
  const results = document.getElementById(id + "-results");
  if (!input || !results) return;

  function hide() {
    results.style.display = "none";
  }

  function show() {
    const term = input.value.toLowerCase();
    results.innerHTML = "";
    const matches = PILOTS.filter((p) =>
      p.name.toLowerCase().includes(term),
    );
    matches.forEach((p) => {
      const div = document.createElement("div");
      div.className = "result-item";
      div.textContent = p.name;
      div.addEventListener("mousedown", () => {
        input.value = p.name;
        hide();
        disableDuplicatePilot({ target: input });
      });
      results.appendChild(div);
    });
    results.style.display = matches.length ? "block" : "none";
  }

  input.addEventListener("input", show);
  input.addEventListener("focus", show);
  document.addEventListener("click", (e) => {
    if (!results.contains(e.target) && e.target !== input) hide();
  });
}
document
  .getElementById("leftPilot")
  .addEventListener("input", disableDuplicatePilot);
document
  .getElementById("rightPilot")
  .addEventListener("input", disableDuplicatePilot);
["leftPilot", "rightPilot"].forEach((id) => setupPilotSearch(id));
["seat1a", "seat2a", "seat1c"].forEach((id) => {
  document.getElementById(id).addEventListener("change", disableDuplicateMedic);
});
function populateDropdown(select, region) {
  select.innerHTML = "";
  // Add placeholder
  const placeholder = new Option("Select Waypoint", "");
  select.appendChild(placeholder);
  // Add "Scene"
  const sceneOption = new Option("Scene", "SCENE");
  select.appendChild(sceneOption);
  // Add region-filtered waypoints
  Object.keys(waypoints)
    .filter(
      (code) => region === "ALL" || waypoints[code].regions.includes(region),
    )
    .sort((a, b) => waypoints[a].name.localeCompare(waypoints[b].name))
    .forEach((code) => {
      const option = new Option(`${waypoints[code].name} (${code})`, code);
      select.appendChild(option);
    });
}
function populateAllDropdowns() {
  const region = document.getElementById("region-select").value;
  const allSelects = document.querySelectorAll(".from, .to");
  allSelects.forEach((select) => {
    const selectedValue = select.value;
    select.innerHTML = ""; // Clear everything
    // Placeholder
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select Waypoint";
    select.appendChild(placeholder);
    // Scene
    const scene = document.createElement("option");
    scene.value = "SCENE";
    scene.textContent = "Scene";
    select.appendChild(scene);
    // Add filtered and sorted waypoints
    Object.keys(waypoints)
      .filter(
        (code) => region === "ALL" || waypoints[code].regions.includes(region),
      )
      .sort((a, b) => waypoints[a].name.localeCompare(waypoints[b].name))
      .forEach((code) => {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${waypoints[code].name} (${code})`;
        select.appendChild(option);
      });
    // Restore value if still valid
    const exists = Array.from(select.options).some(
      (opt) => opt.value === selectedValue,
    );
    if (exists) select.value = selectedValue;
  });
}
function toggleSceneInputs(select) {
  const parent = select.closest(".leg-row");
  const scene = parent.querySelector("." + select.className + "-scene");
  scene.style.display = select.value === "SCENE" ? "block" : "none";
}
function addLeg() {
  const legCount = document.querySelectorAll(".leg-row").length + 1;
  const prevLeg = document.querySelector(`.leg-row:nth-child(${legCount - 1})`);
  const prevTo = prevLeg.querySelector(".to");
  const prevToLat = prevLeg.querySelector(".to-lat")?.value;
  const prevToLon = prevLeg.querySelector(".to-lon")?.value;
  const newRow = document.createElement("div");
  newRow.className = "leg-row";
  newRow.innerHTML = `
    <table style="width: 100%; margin-bottom: 10px;">
      <tr>
        <td>
          <label>Leg ${legCount}:</label>
          <select class="from" onchange="toggleSceneInputs(this)"></select>
          <div class="scene-inputs from-scene">
            Lat: <input type="number" placeholder="49.1939" step="0.0001" class="from-lat">
            Lon: <input type="number" placeholder="-123.1833" step="0.0001" class="from-lon">
          </div>
          ➝
          <select class="to" onchange="toggleSceneInputs(this)"></select>
          <div class="scene-inputs to-scene">
            Lat: <input type="number" placeholder="49.1939" step="0.0001" class="to-lat">
            Lon: <input type="number" placeholder="-123.1833" step="0.0001" class="to-lon">
          </div>
          <button class="remove-leg-btn">Remove</button>
        </td>
      </tr>
      <tr>
        <td style="padding-left: 20px;">
          <label><input type="checkbox" class="patient-checkbox"> Patient</label>
          <label><input type="checkbox" class="escort-checkbox"> Escort</label>
          <label>Fuel Uplift (kg):</label>
          <input type="number" class="legfuel" style="width: 80px;">
        </td>
      </tr>
    </table>
  `;
  // Append the new row
  document.getElementById("legs").appendChild(newRow);
  // Populate dropdowns
  const from = newRow.querySelector(".from");
  const to = newRow.querySelector(".to");
  const region = document.getElementById("region-select").value;
  populateDropdown(from, region);
  populateDropdown(to, region);
  // Auto-fill previous TO → next FROM
  if (prevTo.value === "SCENE") {
    from.value = "SCENE";
    toggleSceneInputs(from);
    newRow.querySelector(".from-lat").value = prevToLat;
    newRow.querySelector(".from-lon").value = prevToLon;
  } else {
    from.value = prevTo.value;
  }
  // ✅ Attach remove handler
  newRow
    .querySelector(".remove-leg-btn")
    .addEventListener("click", function () {
      newRow.remove();
      document.querySelectorAll(".leg-row").forEach((row, idx) => {
        row.querySelector("label").textContent = `Leg ${idx + 1}:`;
      });
    });
}
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(
    R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 0.539957,
  );
}
function calculateRoute() {
  const cruise = parseFloat(document.getElementById("speed").value);
  const burn = parseFloat(document.getElementById("fuel").value);
  const startFuelInput = document.getElementById("startFuel");
  let fuel = parseFloat(startFuelInput.value);
  const initialFuel = fuel;
  const errors = [];
  if (isNaN(fuel)) {
    errors.push("Start fuel must be a number");
    fuel = 0;
  } else if (fuel < MIN_FUEL) {
    alert(`Start fuel below ${MIN_FUEL} kg (~20 min)`);
    errors.push(`Start fuel must be at least ${MIN_FUEL} kg (~20 min)`);
  } else if (fuel > MAX_FUEL) {
    alert(`Start fuel must not exceed ${MAX_FUEL} kg`);
    errors.push(`Start fuel must not exceed ${MAX_FUEL} kg`);
  }
  const seat1aName = document.getElementById("seat1a").value;
  const seat2aName = document.getElementById("seat2a").value;
  const seat1cName = document.getElementById("seat1c").value;
  const seat1a = MEDICS.find((m) => m.name === seat1aName)?.weight || 0;
  const seat2a = MEDICS.find((m) => m.name === seat2aName)?.weight || 0;
  const seat1c = MEDICS.find((m) => m.name === seat1cName)?.weight || 0;
  const baggage = parseFloat(document.getElementById("baggage").value) || 0;
  // These are global patient/escort weights
  const globalPatientWeight =
    parseFloat(document.getElementById("patient").value) || 0;
  const globalEscortWeight =
    parseFloat(document.getElementById("escort").value) || 0;
  const selectedHeli = document.getElementById("helicopter").value;
  const heliWeight =
    HELICOPTERS.find((h) => h.reg === selectedHeli)?.weight || 0;
  const leftPilotName = document.getElementById("leftPilot").value;
  const rightPilotName = document.getElementById("rightPilot").value;
  const leftWeight = PILOTS.find((p) => p.name === leftPilotName)?.weight || 0;
  const rightWeight =
    PILOTS.find((p) => p.name === rightPilotName)?.weight || 0;
  let dist = 0,
    mins = 0,
    totalFuel = 0,
    lastWeight = 0;
  let table = `
<table>
  <thead>
    <tr>
      <th rowspan="2">Leg</th>
      <th rowspan="2">From ➝ To</th>
      <th rowspan="2">NM</th>
      <th rowspan="2">Heading</th>
      <th rowspan="2">Time</th>
      <th colspan="2">Fuel (kg)</th>
      <th rowspan="2">Takeoff Weight (kg)</th>
    </tr>
    <tr>
      <th>Departure</th>
      <th>Destination</th>
    </tr>
  </thead>
  <tbody>
`;
  const legWeights = [];
  let finalDestinationFuel = fuel;
  document.querySelectorAll(".leg-row").forEach((leg, i) => {
    const fromSel = leg.querySelector(".from");
    const toSel = leg.querySelector(".to");
    if (!fromSel.value || !toSel.value) return;
    let fLat, fLon, tLat, tLon, fName, tName;
    if (fromSel.value === "SCENE") {
      fLat = parseFloat(leg.querySelector(".from-lat").value);
      fLon = parseFloat(leg.querySelector(".from-lon").value);
      fName = `SCENE (${fLat}, ${fLon})`;
    } else {
      const f = waypoints[fromSel.value];
      fLat = f.lat;
      fLon = f.lon;
      fName = f.name; // ← use the full name instead of the code
    }
    if (toSel.value === "SCENE") {
      tLat = parseFloat(leg.querySelector(".to-lat").value);
      tLon = parseFloat(leg.querySelector(".to-lon").value);
      tName = `SCENE (${tLat}, ${tLon})`;
    } else {
      const t = waypoints[toSel.value];
      tLat = t.lat;
      tLon = t.lon;
      tName = t.name; // ← use the full name instead of the code
    }
    const d = haversine(fLat, fLon, tLat, tLon);
    const h =
      Math.round(
        Math.atan2(
          Math.sin(((tLon - fLon) * Math.PI) / 180) *
            Math.cos((tLat * Math.PI) / 180),
          Math.cos((fLat * Math.PI) / 180) * Math.sin((tLat * Math.PI) / 180) -
            Math.sin((fLat * Math.PI) / 180) *
              Math.cos((tLat * Math.PI) / 180) *
              Math.cos(((tLon - fLon) * Math.PI) / 180),
        ) *
          (180 / Math.PI) +
          360,
      ) % 360;
    const timeHr = d / cruise;
    const min = Math.round(timeHr * 60);
    const legFuel = Math.round(timeHr * burn);
    // ✅ These now refer to the current leg:
    const patientIncluded = leg.querySelector(".patient-checkbox")?.checked;
    const escortIncluded = leg.querySelector(".escort-checkbox")?.checked;
    const fuelUp = parseFloat(leg.querySelector(".legfuel")?.value) || 0;
    const patientWeight = patientIncluded ? globalPatientWeight : 0;
    const escortWeight = escortIncluded ? globalEscortWeight : 0;
    // ✅ Weight before burning leg fuel
    const departureFuel = fuel;
    const totalWeight =
      heliWeight +
      departureFuel +
      leftWeight +
      rightWeight +
      seat1a +
      seat2a +
      seat1c +
      baggage +
      patientWeight +
      escortWeight;
    if (totalWeight > MAX_TAKEOFF_WEIGHT) {
      alert(`Takeoff weight exceeds ${MAX_TAKEOFF_WEIGHT} kg on leg ${i + 1}`);
      errors.push(
        `Takeoff weight exceeds ${MAX_TAKEOFF_WEIGHT} kg on leg ${i + 1}`,
      );
    }
    lastWeight = totalWeight;
    // ✅ Calculate destination fuel then apply uplift
    fuel -= legFuel;
    const destinationFuel = fuel;
    finalDestinationFuel = destinationFuel;
    let lowFuelWarningShown = false;
    if (destinationFuel < MIN_FUEL) {
      alert(
        `Fuel level at destination must be at least ${MIN_FUEL} kg on leg ${i + 1}`,
      );
      errors.push(
        `Fuel level at destination must be at least ${MIN_FUEL} kg on leg ${i + 1}`,
      );
      lowFuelWarningShown = true;
    }
    fuel += fuelUp;
    if (fuel < MIN_FUEL && !lowFuelWarningShown) {
      alert(`Fuel level below ${MIN_FUEL} kg (~20 min) on leg ${i + 2}`);
      errors.push(
        `Fuel level must be at least ${MIN_FUEL} kg (~20 min) on leg ${i + 2}`,
      );
    } else if (fuel > MAX_FUEL) {
      alert(`Fuel level must not exceed ${MAX_FUEL} kg on leg ${i + 2}`);
      errors.push(`Fuel level must not exceed ${MAX_FUEL} kg on leg ${i + 2}`);
    }
    dist += d;
    mins += min;
    totalFuel += legFuel;
    table += `<tr>
      <td>${i + 1}</td>
      <td>${fName} ➝ ${tName}</td>
      <td>${d}</td>
      <td>${h.toString().padStart(3, "0")}°</td>
      <td>${Math.floor(min / 60)}h ${min % 60}m</td>
      <td>${departureFuel}</td>
      <td>${destinationFuel}</td>
      <td>${totalWeight}</td>
    </tr>`;
    const seat2aTotal = seat2a + escortWeight;
    legWeights.push({
      heliWeight,
      leftWeight,
      rightWeight,
      seat1a,
      seat2aTotal,
      seat1c,
      patientWeight,
      baggage,
    });
  });
  table += `<tr>
    <th colspan="2">TOTAL</th>
    <th>${dist}</th><th>-</th>
    <th>${Math.floor(mins / 60)}h ${mins % 60}m</th>
    <th>${initialFuel}</th><th>${finalDestinationFuel}</th><th>-</th>
  </tr></table>`;
  let weightTable =
    '<table class="weight-table tableizer-table"><thead><tr><th></th>';
  legWeights.forEach((_, idx) => {
    weightTable += `<th>Leg ${idx + 1}</th>`;
  });
  weightTable += "</tr></thead><tbody>";
  const addRow = (label, key) => {
    weightTable += `<tr><th>${label}</th>`;
    legWeights.forEach((w) => {
      if (key) {
        weightTable += `<td>${w[key]}</td>`;
      } else {
        weightTable += "<td></td>";
      }
    });
    weightTable += "</tr>";
  };
  addRow("Empty", "heliWeight");
  addRow("Left Seat", "leftWeight");
  addRow("Right Seat", "rightWeight");
  addRow("1A", "seat1a");
  addRow("2A", "seat2aTotal");
  addRow("1C", "seat1c");
  addRow("Stretcher", "patientWeight");
  addRow("Baggage", "baggage");
  addRow("Start Fuel");
  addRow("TOGW");
  weightTable += "</tbody></table>";
  latestLegWeights = legWeights;
  latestWeightTable = weightTable;
  document.getElementById("result").innerHTML = table;
  document.getElementById("weightTable").innerHTML = "";
  document.getElementById("errors").innerHTML = errors.join("<br>");
}
function getPoints() {
  const points = [];
  document.querySelectorAll(".leg-row").forEach((leg, idx) => {
    const fromSel = leg.querySelector(".from");
    const toSel = leg.querySelector(".to");
    if (!fromSel.value || !toSel.value) return;
    if (idx === 0) points.push(extractPoint(leg, "from", fromSel));
    points.push(extractPoint(leg, "to", toSel));
  });
  return points;
  function extractPoint(leg, prefix, sel) {
    if (sel.value === "SCENE") {
      const latInput = leg.querySelector("." + prefix + "-lat");
      const lonInput = leg.querySelector("." + prefix + "-lon");
      const lat = parseFloat(latInput.value);
      const lon = parseFloat(lonInput.value);
      if (isNaN(lat) || isNaN(lon)) {
        throw new Error("Scene latitude and longitude are required");
      }
      return { lat, lon, original: sel.value };
    }
    const wp = waypoints[sel.value];
    return { lat: wp.lat, lon: wp.lon, original: sel.value };
  }
}
function getWeather() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build weather links");
      return;
    }

    const windyRouteStr = points.map((p) => `${p.lat},${p.lon}`).join(";");
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length;
    const windyURL = `https://www.windy.com/route-planner/vfr/${encodeURIComponent(windyRouteStr)}?layer=radar,${avgLat.toFixed(4)},${avgLon.toFixed(4)},7,p:cities`;
    window.open(windyURL, "_blank");
    const fromPoint = points[0];
    const latInt = Math.round(fromPoint.lat * 10000);
    const lonInt = Math.round(fromPoint.lon * 10000);
    const isICAO = /^[A-Z]{4}$/.test(fromPoint.original);
    const hl = isICAO ? fromPoint.original : "";
    const metarURL = `https://metar-taf.com/?c=${latInt}.${lonInt}&hl=${hl}`;
    window.open(metarURL, "_blank");
    // 📍 Google Maps for all Scene Calls (manual lat/lon)
    points.forEach((p) => {
      // Treat as ICAO if original is 3-4 letters/numbers AND no comma (not lat/lon)
      const isICAO = /^[A-Z0-9]{3,4}$/.test(p.original);
      if (!isICAO) {
        // This is a scene call (manual lat/lon)
        const googleMapsURL = `https://maps.google.com/?q=${p.lat},${p.lon}&t=k`;
        window.open(googleMapsURL, "_blank");
      }
    });
  } catch (err) {
    console.error(err);
    alert(err.message || "Unable to open weather information");
  }
}
function openSkyVector() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build a SkyVector link");
      return;
    }
    const skyVectorRoute = points
      .map((p) => toSkyVectorDMM(p.lat, p.lon))
      .join("+");
    if (!skyVectorRoute) {
      throw new Error("No valid points to create a SkyVector route.");
    }
    const skyVectorURL = `https://skyvector.com/?fpl=${encodeURIComponent(skyVectorRoute)}`;
    window.open(skyVectorURL, "_blank");
  } catch (err) {
    console.error("Failed to open SkyVector:", err);
    alert(err.message || "Unable to open SkyVector");
  }
}
function toSkyVectorDMM(lat, lon) {
  function convert(value, isLat) {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const min = Math.round((abs - deg) * 60)
      .toString()
      .padStart(2, "0");
    const dir = isLat ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
    const degStr = deg.toString().padStart(isLat ? 2 : 3, "0");
    return `${degStr}${min}${dir}`;
  }
  return `${convert(lat, true)}${convert(lon, false)}`;
}
function convertDDMMmm(value, isLat) {
  const dir = isLat ? (value >= 0 ? "N" : "S") : value >= 0 ? "E" : "W";
  const abs = Math.abs(value);
  const deg = Math.floor(abs);
  const min = (abs - deg) * 60;
  const paddedDeg = isLat
    ? deg.toString().padStart(2, "0")
    : deg.toString().padStart(3, "0");
  const minStr = min.toFixed(2).padStart(5, "0");
  return `${paddedDeg}${minStr}${dir}`;
}
function formatForForeFlight(p) {
  if (p.original.includes(",")) {
    const lat = convertDDMMmm(p.lat, true);
    const lon = convertDDMMmm(p.lon, false);
    return `${lat}/${lon}`;
  }
  return p.original;
}
function openForeFlight() {
  try {
    const points = getPoints();
    const route = points.map(formatForForeFlight).join("+");
    const url = `foreflightmobile://maps/search?q=${route}`;
    window.open(url, "_blank");
  } catch (err) {
    console.error(err);
  }
}
function composeEmail() {
  try {
    const points = getPoints();
    if (!points.length) {
      alert("No route points to build email links");
      return;
    }
    const foreflightURLs = [];
    for (let i = 0; i < points.length - 1; i++) {
      const legRoute = [points[i], points[i + 1]]
        .map(formatForForeFlight)
        .join("+");
      const url = `foreflightmobile://maps/search?q=${legRoute}`;
      foreflightURLs.push(url);
    }
    const windyRouteStr = points.map((p) => `${p.lat},${p.lon}`).join(";");
    const avgLat = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
    const avgLon = points.reduce((sum, p) => sum + p.lon, 0) / points.length;
    const windyURL = `https://www.windy.com/route-planner/vfr/${encodeURIComponent(windyRouteStr)}?layer=radar,${avgLat.toFixed(4)},${avgLon.toFixed(4)},7,p:cities`;
    const fromPoint = points[0];
    const latInt = Math.round(fromPoint.lat * 10000);
    const lonInt = Math.round(fromPoint.lon * 10000);
    const isICAO = /^[A-Z]{4}$/.test(fromPoint.original);
    const hl = isICAO ? fromPoint.original : "";
    const metarURL = `https://metar-taf.com/?c=${latInt}.${lonInt}&hl=${hl}`;
    const skyVectorRoute = points
      .map((p) => toSkyVectorDMM(p.lat, p.lon))
      .join("+");
    const skyVectorURL = `https://skyvector.com/?fpl=${encodeURIComponent(skyVectorRoute)}`;
    const subject = encodeURIComponent("Flight Route Planner Links");
    const body = encodeURIComponent(
      `Here are the route planner links:\n\n` +
        `ForeFlight (Links for each leg):\n${foreflightURLs.map((url, i) => `Leg ${i + 1}: ${url}`).join("\n")}\n\n` +
        `Windy:\n${windyURL}\n\n` +
        `METAR-TAF:\n${metarURL}\n\n` +
        `SkyVector:\n${skyVectorURL}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  } catch (err) {
    console.error(err);
  }
}
function printFlightLog() {
  const date = new Date().toLocaleDateString();
  const reg = document.getElementById("helicopter").value || "";
  const left = document.getElementById("leftPilot").value || "";
  const right = document.getElementById("rightPilot").value || "";
  const seat1a = document.getElementById("seat1a").value || "";
  const seat2a = document.getElementById("seat2a").value || "";
  const seat1c = document.getElementById("seat1c").value || "";
  const legs = [];
  document.querySelectorAll(".leg-row").forEach((leg, i) => {
    if (i < 10) {
      const fromSel = leg.querySelector(".from");
      const toSel = leg.querySelector(".to");
      let from = fromSel.value || "";
      let to = toSel.value || "";

      if (from === "SCENE") {
        const lat = leg.querySelector(".from-lat").value;
        const lon = leg.querySelector(".from-lon").value;
        from = lat && lon ? `${lat},${lon}` : "";
      } else if (from) {
        const fName = waypoints[from]?.name;
        if (fName) from = `${from}-${fName}`;
      }

      if (to === "SCENE") {
        const lat = leg.querySelector(".to-lat").value;
        const lon = leg.querySelector(".to-lon").value;
        to = lat && lon ? `${lat},${lon}` : "";
      } else if (to) {
        const tName = waypoints[to]?.name;
        if (tName) to = `${to}-${tName}`;
      }

      legs.push({ from, to });
    }
  });
  let legRows = "";
  for (let i = 0; i < 10; i++) {
    const leg = legs[i] || { from: "&nbsp;", to: "&nbsp;" };
    legRows += `<tr><td>${i + 1}</td>
      <td>${leg.from}</td>
      <td colspan="2" >${leg.to}</td>
      <td style="text-align: center;" >:</td>
      <td style="text-align: center;" >:</td>
      <td style="text-align: center;" >:</td>
      <td style="text-align: center;" >:</td>
      <td>&nbsp;</td>
      <td></td>
      <td>&nbsp;</td>
      <td>&nbsp;</td>
      <td colspan="5" </td></tr>`;
  }
  const weightSection = latestWeightTable
    ? `<br>${latestWeightTable}`
    : "";
  const html = `
    <style type="text/css">
      table.tableizer-table { 
      font-size: 8px; border: 
      1px solid #CCC; 
      font-family: Arial, Helvetica, sans-serif;
      table-layout: fixed;
      border-collapse: collapse;
      border-spacing: 0; 
      }
      .tableizer-table th,
    .tableizer-table td {
      border: 1px solid #000;
      padding: 4px;
      margin: 0;
      font-weight: normal !important;
}
    }
    .tableizer-table th {
      background-color: #FFF;
      color:           #000;
    }
    .spacer {
      border: none;
      visibility: hidden;
      padding: 0;
    }
    </style>
    <table class="tableizer-table">
      <tbody>
        <tr>
          <th>DATE</th>
          <td colspan="2" style="text-align: center;">${date}</td>
          <th>REG:</th>
          <td colspan="2">${reg}</td>
          <th>LEFT SEAT:</th>
          <td colspan="3">${left}</td>
          <th>RIGHT SEAT:</th>
          <td colspan="3" style="width:70px;">${right}</td>
          <th>SHIFT:</th>
          <td colspan="2" style="width:40px;"></td>
        </tr>
        <tr>
          <td>FLT#</td><td colspan="2"></td>
          <td>Seat 1A:</td><td colspan="2">${seat1a}</td>
          <td>Seat 2A:</td><td colspan="3">${seat2a}</td>
          <td>Seat 1C:</td><td colspan="3">${seat1c}</td>
          <td>SQK:</td>
          <td colspan="2"></td>
        </tr>
        <tr><td>LEG</td>
        <td style="width:50px;" >ORIGIN</td>
        <td colspan="2" >DESTINATION</td>
        <td>START</td>
        <td style="width:40px;" >UP</td>
        <td>DOWN</td>
        <td>STOP</td>
        <td>AIR</td>
        <td>FLT</td>
        <td>FUEL UPLIFT</td>
        <td>SOULS</td>
        <td colspan="5" style="text-align: center;" >REMARKS</td></tr>
        ${legRows}
        <tr><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td><td class="spacer"></td>
        </td><td>TOTALS</td><td style="text-align: center;">.</td><td style="text-align: center;">.</td></tr>
      </tbody>
    </table>
    ${weightSection}`;
  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  win.print();
}
populatePilotDropdowns();
populateMedicDropdowns();
populateAllDropdowns();
disableDuplicatePilot();
disableDuplicateMedic();
populateHelicopterDropdown();
