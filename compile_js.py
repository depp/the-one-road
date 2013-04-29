#!/usr/bin/env python3
import os
paths = ['const.js']
for path in sorted(os.listdir('js')):
    if path.endswith('.js') and not path.startswith('.'):
        paths.append(os.path.join('js', path))
with open('game.js', 'w') as fp:
    for path in paths:
        print(path)
        data = open(path, 'r').read()
        fp.write(('// {}\n'*3).format('='*40, path, '='*40))
        fp.write(data)
        if not data.endswith('\n'):
            fp.write('\n')
    fp.write('// Footer\n'
             'main.start();\n'
             'main.newGame();\n')
