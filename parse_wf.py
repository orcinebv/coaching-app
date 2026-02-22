import json
d = json.load(open('C:/Users/patri/AppData/Local/Temp/workflow.json'))
data = d.get('data', d)
for n in data.get('nodes', []):
    t = n.get('type', '')
    if 'webhook' in t.lower():
        print('Node:', n['name'], '| type:', t)
        print('Params:', json.dumps(n.get('parameters', {}), indent=2))
