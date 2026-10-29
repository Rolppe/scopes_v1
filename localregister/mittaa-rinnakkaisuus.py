import subprocess, re, collections, sys
def g(*a): return subprocess.run(['git',*a],capture_output=True,text=True).stdout
log=g('log','--format=@@%H|%ct|%(trailers:key=Claude-Session,valueonly,separator=)','--name-only','--','*REKISTERI.md')
commits=[]
for blk in log.split('@@')[1:]:
    head,*files=blk.strip().split('\n')
    h,t,s=head.split('|',2)
    for f in files:
        if f.endswith('REKISTERI.md'): commits.append((f,int(t),s.strip() or None,h))
def touched(h,f):
    d=g('show','-U0','--format=',h,'--',f)
    try: post=g('show',f'{h}:{f}').split('\n')
    except: post=[]
    sec=set(); rows=set()
    for m in re.finditer(r'^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@',d,re.M):
        a=int(m.group(1)); n=int(m.group(2) or 1)
        for ln in range(a,a+max(n,1)):
            hd='(alku)'
            for i in range(min(ln,len(post))-1,-1,-1):
                if post[i].startswith('## '): hd=post[i][3:].strip(); break
                if post[i].startswith('SEURAAVA PAKETTI'): pass
            if 0<ln<=len(post):
                L=post[ln-1]
                if L.startswith('SEURAAVA PAKETTI'): hd='SEURAAVA'
                key=L.split('|')[1].strip()[:60] if L.startswith('|') else L[:60]
                if not L.startswith('Tilanne:'): rows.add((hd,key))
            sec.add(hd)
    return sec,rows
span={}
for line in g('log','--format=%ct|%(trailers:key=Claude-Session,valueonly,separator=)').split('\n'):
    if '|' not in line: continue
    t,ss=line.split('|',1); ss=ss.strip()
    if not ss: continue
    t=int(t); a=span.get(ss,(t,t)); span[ss]=(min(a[0],t),max(a[1],t))
byf=collections.defaultdict(list)
for f,t,s,h in commits: byf[f].append((t,s,h))
W=int(sys.argv[1]) if len(sys.argv)>1 else 7200
pairs=0; samefile_any=0; samesec=collections.Counter(); samerow=0; samerow_ns=[]; secall=collections.Counter()
for f,cs in byf.items():
    cs.sort()
    for i in range(1,len(cs)):
        (t0,s0,h0),(t1,s1,h1)=cs[i-1],cs[i]
        if s0 and s1 and s0!=s1 and t1-t0<=W and span[s0][1]>=span[s1][0] and span[s1][1]>=span[s0][0] and min(span[s0][1],span[s1][1])>max(span[s0][0],span[s1][0]):
            pairs+=1
            a,ra=touched(h0,f); b,rb=touched(h1,f)
            for x in a&b: samesec[x]+=1
            if a&b: samefile_any+=1
            if ra&rb: samerow+=1
            if {r for r in ra&rb if r[0]!='SEURAAVA'}: samerow_ns.append((f,sorted({r for r in ra&rb if r[0]!='SEURAAVA'})[:2]))
print(f"rekisterimuutoksia {len(commits)}, tiedostoja {len(byf)}, sessiotunnisteellisia {sum(1 for c in commits if c[2])}")
print(f"ikkuna {W//60} min: eri sessioiden perättäiset muutokset samaan tiedostoon {pairs}; joista sama osio {samefile_any}; sama rivi {samerow}")
print("yhteiset osiot:",samesec.most_common(6)); print("sama rivi ilman SEURAAVA:",len(samerow_ns)); [print(" ",x) for x in samerow_ns[:6]]
