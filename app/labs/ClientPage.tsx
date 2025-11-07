'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LabProject, LabCategory } from './lib/types';
import { addProject, deleteCover, getCover, loadProjects, removeProject, saveCover, slugify, updateProject } from './lib/store';
import Controls, { SortKey } from './components/Controls';
import Card from './components/Card';
import ViewerDrawer from './components/ViewerDrawer';

function useQueryParam(name: string) {
  const [value, setValue] = useState<string | null>(null);
  useEffect(()=>{
    const url = new URL(window.location.href);
    setValue(url.searchParams.get(name));
  }, []);
  return value;
}

export default function LabsPage(){
  const [list, setList] = useState<LabProject[]>([]);
  const [viewer, setViewer] = useState<LabProject|null>(null);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<'All'|LabCategory>('All');
  const [sort, setSort] = useState<SortKey>('newest');

  // Add/Edit form state
  const [editing, setEditing] = useState<LabProject | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LabCategory>('HTML');
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');
  const [path, setPath] = useState('');
  const [coverFile, setCoverFile] = useState<File|null>(null);

  // Deep links
  const openSlug = useQueryParam('open');
  const openNew = useQueryParam('new');

  useEffect(()=>{ setList(loadProjects()); }, []);
  useEffect(()=>{
    if (openSlug && list.length){
      const p = list.find(p=>p.slug===openSlug);
      if (p) setViewer(p);
    }
  }, [openSlug, list]);
  useEffect(()=>{
    if (openNew) { startAdd(); }
  }, [openNew]);

  function onControlsChange(s:{q:string; cat:'All'|LabCategory; sort:SortKey}){
    setQ(s.q); setCat(s.cat); setSort(s.sort);
  }

  const filtered = useMemo(()=>{
    let out = [...list];
    const qq = q.trim().toLowerCase();
    if (qq) out = out.filter(p => p.title.toLowerCase().includes(qq) || p.tags.join(' ').toLowerCase().includes(qq));
    if (cat !== 'All') out = out.filter(p => p.category === cat);
    if (sort === 'newest') {
      out.sort((a,b)=> (b.dateAdded||'').localeCompare(a.dateAdded||''));
    } else {
      out.sort((a,b)=> (b.views||0) - (a.views||0));
    }
    return out;
  }, [list, q, cat, sort]);

  function resetForm() {
    setEditing(null); setTitle(''); setCategory('HTML'); setTags(''); setSummary(''); setPath(''); setCoverFile(null);
  }
  function startAdd(){
    resetForm(); (document.getElementById('labs-form') as HTMLDialogElement)?.showModal();
  }
  function startEdit(p: LabProject){
    setEditing(p); setTitle(p.title); setCategory(p.category); setTags(p.tags.join(', ')); setSummary(p.summary||''); setPath(p.path||''); setCoverFile(null);
    (document.getElementById('labs-form') as HTMLDialogElement)?.showModal();
  }
  async function handleSave(){
    const slug = (title ? title : 'project').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
    let coverId: string | undefined = editing?.coverId;
    if (coverFile){
      coverId = editing?.coverId || (crypto.randomUUID?.() || Math.random().toString(36).slice(2,10));
      await saveCover(coverId, coverFile);
    }
    if (editing){
      updateProject(editing.id, {
        title, slug, category, tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        summary: summary || undefined, path, coverId
      });
    } else {
      addProject({
        slug, title, category, tags: tags.split(',').map(s=>s.trim()).filter(Boolean),
        summary: summary || undefined, path, coverId
      } as any);
    }
    setList(loadProjects()); (document.getElementById('labs-form') as HTMLDialogElement)?.close(); resetForm();
  }
  async function handleDelete(p:LabProject){
    if (p.coverId) await deleteCover(p.coverId);
    removeProject(p.id); setList(loadProjects());
  }

  function downloadHtmlStarter(){
    const slug = (title || 'my-lab').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)+/g,'');
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title || 'My Lab Project'}</title>
<style>html,body{height:100%;margin:0}body{display:grid;place-items:center;font:16px/1.5 system-ui,Segoe UI,Roboto,Helvetica,Arial}</style>
</head><body>
  <main>
    <h1>${title || 'My Lab Project'}</h1>
    <p>Starter template. Edit me.</p>
  </main>
</body></html>`;
    const blob = new Blob([html], {type:'text/html'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'index.html'; a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),0);
    alert('Save to /public/labs/'+slug+'/index.html and set path to /labs/'+slug+'/index.html');
  }

  return (
    <main className="min-h-screen gaia-surface">
      <div className="fixed left-4 top-4 z-40">
        <a href="/" className="gaia-glass-strong gaia-border inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold">⟵ GAIA</a>
      </div>

      <div className="mx-auto max-w-6xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-wide">Labs — Week 6</h1>
          <div className="flex items-center gap-2">
            <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={startAdd}>Add project</button>
            <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm" onClick={downloadHtmlStarter}>HTML starter</button>
          </div>
        </div>

        <Controls onChange={(s)=>{ setQ(s.q); setCat(s.cat); setSort(s.sort); }} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <Card
              key={p.id}
              proj={p}
              onOpen={()=>setViewer(p)}
              onEdit={()=>startEdit(p)}
              onDelete={()=>handleDelete(p)}
            />
          ))}
          {filtered.length===0 && (
            <div className="gaia-muted">No projects yet. Click “Add project”.</div>
          )}
        </div>
      </div>

      <ViewerDrawer open={!!viewer} project={viewer} onClose={()=>{ setViewer(null); setList(loadProjects()); }} />

      {/* Add/Edit dialog */}
      <dialog id="labs-form" className="gaia-panel gaia-dialog rounded-xl border p-0 shadow-2xl">
        <form method="dialog" className="w-[min(92vw,720px)]">
          <div className="gaia-border flex items-center justify-between border-b p-3">
            <div className="font-extrabold">{editing? 'Edit project' : 'Add project'}</div>
            <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm" value="cancel" onClick={()=>resetForm()}>Close</button>
          </div>
          <div className="p-3 space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <div className="text-xs opacity-70 mb-1">Title</div>
                <input className="gaia-input w-full rounded-lg border px-3 py-1.5" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Project title" />
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">Category</div>
                <select className="gaia-input w-full rounded-lg border px-3 py-1.5" value={category} onChange={e=>setCategory(e.target.value as LabCategory)}>
                  <option>HTML</option><option>CSS</option><option>JS</option><option>Other</option>
                </select>
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">Tags (comma separated)</div>
                <input className="gaia-input w-full rounded-lg border px-3 py-1.5" value={tags} onChange={e=>setTags(e.target.value)} placeholder="forms, layout, DOM" />
              </div>
              <div>
                <div className="text-xs opacity-70 mb-1">Path (public)</div>
                <input className="gaia-input w-full rounded-lg border px-3 py-1.5" value={path} onChange={e=>setPath(e.target.value)} placeholder="/labs/my-lab/index.html" />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs opacity-70 mb-1">Summary (optional)</div>
                <textarea className="gaia-input w-full rounded-lg border px-3 py-1.5" value={summary} onChange={e=>setSummary(e.target.value)} rows={3} placeholder="Short description..." />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs opacity-70 mb-1">Cover image (optional)</div>
                <input type="file" accept="image/*" onChange={e=>setCoverFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              {editing && <button className="gaia-border rounded-lg border px-3 py-1.5 text-sm" onClick={(e)=>{ e.preventDefault(); handleDelete(editing); (document.getElementById('labs-form') as HTMLDialogElement)?.close(); }}>Delete</button>}
              <button className="gaia-contrast rounded-lg border px-3 py-1.5 text-sm font-semibold" onClick={(e)=>{ e.preventDefault(); handleSave(); }}>Save</button>
            </div>
          </div>
        </form>
      </dialog>
    </main>
  );
}
