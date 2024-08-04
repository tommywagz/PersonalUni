#! /usr/bin/env python3

import atexit, os, re, subprocess, sys, shutil, re

NAME       = "tide"
C_SOLUTION = "../solutions/tide.c"
MAIN_FILE  = "../files.ln/main.c"
INCLUDE    = "../files.ln/"

print(f"""
max_cpu = 15
files = {NAME}.c
compile_commands = ["dcc -o {NAME} main.c $(ls *.c|grep -Ev \'({NAME}|main)\\.c\')", "dcc -o {NAME} main.c $(ls *.c|grep -Ev \'({NAME}|main)\\.c\')"]
program = {NAME}
allow_unexpected_stderr = True
""")


tests = """
    # subset 0 - cd, pwd
    ../tide
    & cd /usr/bin
    & pwd
    & q

    # subset 0 - cd: home directory
    HOME=/etc ../tide
    & cd ~
    & pwd
    & q

    # subset 0 - cd: non-existent directory
    ../tide
    & cd doesnt_exist
    & q

    # subset 0 - cd, ls
    ../tide
    & cd lorem
    & ls
    & cd ..
    & cd ro_dir
    & ls
    & cd ..
    & q

    # subset 1 - test examples
    ../tide
    & t lorem.txt
    & t a
    & t lorem/ipsum.txt
    & t forbidden
    & t ro_dir/empty.txt
    & t lorem
    & q

    # subset 1 - non-existent
    ../tide
    & t doesnt_exist
    & q

    # subset 1 - non-existent
    ../tide
    & x doesnt_exist
    & q

    # subset 1 - encrypt 1 byte file
    /bin/echo -n "A" > one_byte.txt
    chmod 660 one_byte.txt
    ../tide
    & x one_byte.txt
    & q
    hexdump -C one_byte.txt.xor
    rm one_byte.txt

    # subset 1 - encrypt 4 byte file
    /bin/echo -n "ABCD" > four_byte.txt
    chmod 660 four_byte.txt
    ../tide
    & x four_byte.txt
    & q
    hexdump -C four_byte.txt.xor
    rm four_byte.txt

    # subset 1 - encrypt 8 byte file
    /bin/echo -n "HGFEDCBA" > eight_byte.txt
    chmod 660 eight_byte.txt
    ../tide
    & x eight_byte.txt
    & q
    hexdump -C eight_byte.txt.xor
    rm eight_byte.txt

    # subset 1 - encrypt 9 byte file
    /bin/echo -n "abcdefghi" > nine_byte.txt
    chmod 660 nine_byte.txt
    ../tide
    & x nine_byte.txt
    & q
    hexdump -C nine_byte.txt.xor
    rm nine_byte.txt

    # subset 1 - encrypt 16 byte file
    /bin/echo -n "abcdefghijklmnop" > sixteen_byte.txt
    chmod 660 sixteen_byte.txt
    ../tide
    & x sixteen_byte.txt
    & q
    hexdump -C sixteen_byte.txt.xor
    rm sixteen_byte.txt

    # subset 1 - encrypt 31 byte file
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHH" > thirty_one_byte.txt
    chmod 660 thirty_one_byte.txt
    ../tide
    & x thirty_one_byte.txt
    & q
    hexdump -C thirty_one_byte.txt.xor
    rm thirty_one_byte.txt

    # subset 1 - encrypt 33 byte file
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHI" > thirty_three_byte.txt
    chmod 660 thirty_three_byte.txt
    ../tide
    & x thirty_three_byte.txt
    & q
    rm thirty_three_byte.txt

    # subset 1 - xor a file a bunch of times
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHI" > thirty_three_byte.txt
    chmod 660 thirty_three_byte.txt
    umask 007
    ../tide
    & x thirty_three_byte.txt
    & x thirty_three_byte.txt.xor
    & x thirty_three_byte.txt.xor.dec
    & x thirty_three_byte.txt.xor.dec.xor
    & x thirty_three_byte.txt.xor.dec.xor.dec
    & x thirty_three_byte.txt.xor.dec.xor.dec.xor
    & x thirty_three_byte.txt.xor.dec.xor.dec.xor.dec
    & x thirty_three_byte.txt.xor.dec.xor.dec.xor.dec.xor
    & x thirty_three_byte.txt.xor.dec.xor.dec.xor.dec.xor.dec
    & q
    diff -s thirty_three_byte.txt thirty_three_byte.txt.xor.dec.xor.dec.xor.dec.xor.dec
    diff -s thirty_three_byte.txt.xor thirty_three_byte.txt.xor.dec.xor.dec.xor.dec.xor
    rm thirty_three_byte.txt*

    # subset 2 - search filename examples
    ../tide
    & sn lorem
    & q

    # subset 2 - search filename examples
    ../tide
    & sn db
    & q

    # subset 2 - search filename - reserved
    ../tide
    & sn .
    & q

    # subset 2 - search filename - reserved
    ../tide
    & sn ..
    & q

    # subset 2 - search filename - no results
    ../tide
    & sn no-results-here
    & q

    # subset 2 - search content examples
    ../tide
    & sc 3
    & the
    & q

    # subset 2 - search content - no results
    ../tide
    & sn 8
    & noresult
    & q

    # subset 2 - search content examples
    ../tide
    & sf sqlite3_signature
    & q

    # subset 3 - non-existent
    ../tide
    & ee non-existent
    & de non-existent
    & q

    # subset 3 - ecb mode - 1 byte file
    /bin/echo -n "a" > one_byte.txt
    chmod 660 one_byte.txt
    ../tide
    & ee one_byte.txt
    & passwordpassword
    & q
    hexdump -C one_byte.txt.ecb
    rm one_byte.txt*

    # subset 3 - ecb mode - 2 byte file
    /bin/echo -n "ab" > two_byte.txt
    chmod 660 two_byte.txt
    ../tide
    & ee two_byte.txt
    & passwordpassword
    & q
    hexdump -C two_byte.txt.ecb
    rm two_byte.txt*

    # subset 3 - ecb mode - 3 byte file
    /bin/echo -n "abc" > three_byte.txt
    chmod 660 three_byte.txt
    ../tide
    & ee three_byte.txt
    & passwordpassword
    & q
    hexdump -C three_byte.txt.ecb
    rm three_byte.txt*

    # subset 3 - ecb mode - 4 byte file
    /bin/echo -n "abcd" > four_byte.txt
    chmod 660 four_byte.txt
    ../tide
    & ee four_byte.txt
    & passwordpassword
    & q
    hexdump -C four_byte.txt.ecb
    rm four_byte.txt*

    # subset 3 - ecb mode - 8 byte file
    /bin/echo -n "abcdefgh" > eight_byte.txt
    chmod 660 eight_byte.txt
    ../tide
    & ee eight_byte.txt
    & passwordpassword
    & q
    hexdump -C eight_byte.txt.ecb
    rm eight_byte.txt*

    # subset 3 - ecb mode - 9 byte file
    /bin/echo -n "abcdefghi" > nine_byte.txt
    chmod 660 nine_byte.txt
    ../tide
    & ee nine_byte.txt
    & passwordpassword
    & q
    hexdump -C nine_byte.txt.ecb
    rm nine_byte.txt*

    # subset 3 - ecb mode - 16 byte file
    /bin/echo -n "abcdefghijklmnop" > sixteen_byte.txt
    chmod 660 sixteen_byte.txt
    ../tide
    & ee sixteen_byte.txt
    & passwordpassword
    & q
    hexdump -C sixteen_byte.txt.ecb
    rm sixteen_byte.txt*

    # subset 3 - ecb mode - 31 byte file
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHH" > thirty_one_byte.txt
    chmod 660 thirty_one_byte.txt
    ../tide
    & ee thirty_one_byte.txt
    & passwordpassword
    & q
    hexdump -C thirty_one_byte.txt.ecb
    rm thirty_one_byte.txt*

    # subset 3 - ecb mode - 33 byte file
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHI" > thirty_three_byte.txt
    chmod 660 thirty_three_byte.txt
    ../tide
    & ee thirty_three_byte.txt
    & passwordpassword
    & q
    hexdump -C thirty_three_byte.txt.ecb
    rm thirty_three_byte.txt*

    # subset 3 - ecb mode - double encrypt
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHI" > thirty_three_byte.txt
    chmod 660 thirty_three_byte.txt
    umask 007
    ../tide
    & ee thirty_three_byte.txt
    & passwordpassword
    & ee thirty_three_byte.txt.ecb
    & passwordpassword
    & q
    hexdump -C thirty_three_byte.txt.ecb
    hexdump -C thirty_three_byte.txt.ecb.ecb
    rm thirty_three_byte.txt*

    # subset 3 - decrypt png
    ../tide
    & cd ecb_decrypt
    & de 1x1.png.ecb
    & passwordpassword
    & q
    hexdump -C ecb_decrypt/1x1.png.ecb.dec
    rm ecb_decrypt/1x1.png.ecb.dec

    # subset 4 - non-existent
    ../tide
    & ec non-existent
    & dc non-existent
    & q

    # subset 4 - cbc mode - 1 byte file
    /bin/echo -n "a" > one_byte.txt
    chmod 660 one_byte.txt
    ../tide
    & ec one_byte.txt
    & passwordpassword
    & q
    hexdump -C one_byte.txt.cbc
    rm one_byte.txt*

    # subset 4 - cbc mode - 2 byte file
    /bin/echo -n "ab" > two_byte.txt
    chmod 660 two_byte.txt
    ../tide
    & ec two_byte.txt
    & passwordpassword
    & q
    hexdump -C two_byte.txt.cbc
    rm two_byte.txt*

    # subset 4 - cbc mode - 3 byte file
    /bin/echo -n "abc" > three_byte.txt
    chmod 660 three_byte.txt
    ../tide
    & ec three_byte.txt
    & passwordpassword
    & q
    hexdump -C three_byte.txt.cbc
    rm three_byte.txt*

    # subset 4 - cbc mode - 4 byte file
    /bin/echo -n "abcd" > four_byte.txt
    chmod 660 four_byte.txt
    ../tide
    & ec four_byte.txt
    & passwordpassword
    & q
    hexdump -C four_byte.txt.cbc
    rm four_byte.txt*

    # subset 4 - cbc mode - 8 byte file
    /bin/echo -n "abcdefgh" > eight_byte.txt
    chmod 660 eight_byte.txt
    ../tide
    & ec eight_byte.txt
    & passwordpassword
    & q
    hexdump -C eight_byte.txt.cbc
    rm eight_byte.txt*

    # subset 4 - cbc mode - 9 byte file
    /bin/echo -n "abcdefghi" > nine_byte.txt
    chmod 660 nine_byte.txt
    ../tide
    & ec nine_byte.txt
    & passwordpassword
    & q
    hexdump -C nine_byte.txt.cbc
    rm nine_byte.txt*

    # subset 4 - cbc mode - 16 byte file
    /bin/echo -n "abcdefghijklmnop" > sixteen_byte.txt
    chmod 660 sixteen_byte.txt
    ../tide
    & ec sixteen_byte.txt
    & passwordpassword
    & q
    hexdump -C sixteen_byte.txt.cbc
    rm sixteen_byte.txt*

    # subset 4 - cbc mode - 31 byte file
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHH" > thirty_one_byte.txt
    chmod 660 thirty_one_byte.txt
    ../tide
    & ec thirty_one_byte.txt
    & passwordpassword
    & q
    hexdump -C thirty_one_byte.txt.cbc
    rm thirty_one_byte.txt*

    # subset 4 - cbc mode - 33 byte file
    /bin/echo -n "AAAABBBBCCCCDDDDEEEEFFFFGGGGHHHHI" > thirty_three_byte.txt
    chmod 660 thirty_three_byte.txt
    ../tide
    & ec thirty_three_byte.txt
    & passwordpassword
    & q
    hexdump -C thirty_three_byte.txt.cbc
    rm thirty_three_byte.txt*

    # subset 4 - decrypt png
    ../tide
    & cd cbc_decrypt
    & dc 1x1.png.cbc
    & passwordpassword
    & q
    hexdump -C cbc_decrypt/1x1.png.cbc.dec
    rm cbc_decrypt/1x1.png.cbc.dec
"""


os.environ['CDPATH'] = ''
test_number = 1
test_commands = []
program_line = ''
interactive_commands = []
description = ''
subset = ''


compiler = shutil.which("dcc") or shutil.which("clang") or shutil.which("gcc")
if not compiler:
    print("No C compiler?", file=sys.stderr)
    sys.exit(1)

subprocess.run([compiler, C_SOLUTION, MAIN_FILE, f"-I{INCLUDE}", "-o", "tide"])

atexit.register(lambda: os.remove("tide"))
atexit.register(lambda: shutil.rmtree("examples"))

prefix_commands = ''.join(
'''
1521 tide-examples;
cd examples;
'''.splitlines()).strip()

postfix_commands = ''

for t in tests.splitlines() + ['']:
    t = t.strip()

    if not test_commands and t.startswith('#'):
        if '# subset' in t:
            subset = t.split('# subset')[1].split()[0]
        if len(sys.argv) > 1:
            print(t.strip('#\t '), file=sys.stderr)
        continue

    if not test_commands and '=' in t:
        if m := re.match(r'\s*(.*)\s*=\s*(.*)\s*', t):
            if m.group(1).strip() == "subset":
                subset = m.group(2).strip()
                if len(sys.argv) > 1:
                    print(t, file=sys.stderr)
                continue
            if m.group(1).strip() == "description":
                description = m.group(2).strip()
                if len(sys.argv) > 1:
                    print(t, file=sys.stderr)
                continue

    if t.startswith('&'):
        interactive_commands.append(t.strip('& '))
        continue

    if f'../{NAME}' in t:
        test_commands.append(f"{t} 2>/dev/null")
        continue

    if t:
        test_commands.append(t)
        continue

    if not test_commands and not t:
        continue

    if not description:
        description = [t for t in test_commands if f'/{NAME}' in t][0].replace(f'../{NAME}', f'{NAME}')
    shell = "; ".join(test_commands)

    if not subset:
        subset = '_NA'

    stdin = '\n'.join(interactive_commands)
    if stdin:
        stdin += '\n'

    shell = prefix_commands + shell # + postfix_commands
    expected_output_command = shell

    p = subprocess.run(expected_output_command, shell=True, input=stdin, universal_newlines=True, capture_output=True)

    label = f"subset{subset}_test{test_number}"
    print()
    print(label, "description =", repr(description))
    print(label, "command =", repr(shell))

    if stdin:
        print(label, "stdin =", repr(stdin))

    if p.stdout:
        print(f'{label} expected_stdout="""\\\n{os.linesep.join(list(map(lambda x: repr(x)[1:-1], p.stdout.splitlines())))}\n"""')

    if p.stderr:
        print(f'Process stderr: "{repr(p.stderr)}"', file=sys.stderr)

    test_number += 1
    test_commands = []
    description = ''
    subset=''
    program_line = ''
    interactive_commands = []
