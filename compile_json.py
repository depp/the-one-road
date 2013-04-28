#!/usr/bin/env python3
import os
json = {}
for dirpath, dirnames, filenames in os.walk('.'):
    dirnames[:] = [d for d in dirnames if not d.startswith('.')]
    for f in filenames:
        if not f.endswith('.json'):
            continue
        p = os.path.join(dirpath, f)
        name = os.path.splitext(f)[0]
        json[name] = open(p, 'r').read()

with lopen('js/static.js', 'w') as fp:
    for n, v in sorted(json.items()):
        print('JSON_{}={};'.format(n, v.strip()), file=fp)
