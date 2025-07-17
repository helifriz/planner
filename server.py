from flask import Flask, request, jsonify
import os

app = Flask(__name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), 'data.js')


def insert_before_end(lines, start_token, end_token, new_line):
    in_section = False
    for i, line in enumerate(lines):
        if not in_section and start_token in line:
            in_section = True
            continue
        if in_section and line.strip() == end_token:
            lines.insert(i, new_line)
            return True
    return False


@app.route('/addPilot', methods=['POST'])
def add_pilot():
    data = request.get_json(force=True)
    name = (data.get('name') or '').strip()
    weight = data.get('weight')
    if not name or weight is None:
        return jsonify({'error': 'Invalid data'}), 400
    with open(DATA_FILE, 'r') as f:
        lines = f.readlines()
    newline = f'  {{ name: "{name}", weight: {weight} }},\n'
    if not insert_before_end(lines, 'const PILOTS', '];', newline):
        return jsonify({'error': 'Section not found'}), 500
    with open(DATA_FILE, 'w') as f:
        f.writelines(lines)
    return jsonify({'status': 'ok'})


@app.route('/addMedic', methods=['POST'])
def add_medic():
    data = request.get_json(force=True)
    name = (data.get('name') or '').strip()
    weight = data.get('weight')
    if not name or weight is None:
        return jsonify({'error': 'Invalid data'}), 400
    with open(DATA_FILE, 'r') as f:
        lines = f.readlines()
    newline = f'  {{ name: "{name}", weight: {weight} }},\n'
    if not insert_before_end(lines, 'const MEDICS', '];', newline):
        return jsonify({'error': 'Section not found'}), 500
    with open(DATA_FILE, 'w') as f:
        f.writelines(lines)
    return jsonify({'status': 'ok'})


@app.route('/addWaypoint', methods=['POST'])
def add_waypoint():
    data = request.get_json(force=True)
    code = (data.get('code') or '').strip()
    name = (data.get('name') or '').strip()
    regions = data.get('regions') or []
    lat = data.get('lat')
    lon = data.get('lon')
    if not code or not name or not regions or lat is None or lon is None:
        return jsonify({'error': 'Invalid data'}), 400
    with open(DATA_FILE, 'r') as f:
        lines = f.readlines()
    regions_js = '[' + ', '.join(f'"{r}"' for r in regions) + ']'
    newline = f'  {code}: {{ name: "{name}", regions: {regions_js}, lat: {lat}, lon: {lon} }},\n'
    if not insert_before_end(lines, 'const waypoints', '};', newline):
        return jsonify({'error': 'Section not found'}), 500
    with open(DATA_FILE, 'w') as f:
        f.writelines(lines)
    return jsonify({'status': 'ok'})


if __name__ == '__main__':
    app.run(debug=True)
