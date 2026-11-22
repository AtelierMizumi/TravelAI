import { useEffect, useRef, useState } from 'react';
import type { createPavilionViewer } from './landmark-poc/runtime';

type Viewer = ReturnType<typeof createPavilionViewer>;
export function LandmarkPoc({ poster }: { poster?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const host = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open || !host.current) return;
    let cancelled = false;
    import('./landmark-poc/runtime').then(({ createPavilionViewer }) => {
      if (cancelled || !host.current) return;
      viewer.current = createPavilionViewer(host.current, () => { if (!cancelled) setStatus('ready'); }, () => { if (!cancelled) setStatus('error'); });
    }).catch(() => { if (!cancelled) setStatus('error'); });
    return () => { cancelled = true; viewer.current?.dispose(); viewer.current = null; };
  }, [open]);
  const buttonStyle = { border: '1px solid #91cfea', borderRadius: 10, padding: '10px 14px', background: '#e5f5fd', color: '#075782', cursor: 'pointer', font: 'inherit' };
  return <section aria-label="Thử nghiệm mô hình 3D" style={{ border: '1px solid #cee5f0', borderRadius: 20, padding: 20, background: '#f8fcff', color: '#103c5b', fontFamily: 'system-ui, sans-serif' }}>
    <h2 style={{ marginTop: 0 }}>Đình Việt Nam · 3D POC</h2>
    <p>Mô hình minh họa tự tạo, không phải bản quét hay bản phục dựng của địa điểm này.</p>
    <button ref={trigger} style={buttonStyle} aria-expanded={open} onClick={() => { setStatus('loading'); setOpen(value => !value); }}>{open ? 'Đóng 3D' : 'Mở mô hình 3D thử nghiệm'}</button>
    {open && <>
      <p role={status === 'error' ? 'alert' : 'status'}>{status === 'error' ? 'Không thể mở 3D. Bạn vẫn có thể xem ảnh và thông tin địa điểm.' : status === 'loading' ? 'Đang tải 3D…' : '3D sẵn sàng · Kéo ngang để xoay, dùng nút để zoom. Vuốt dọc hoặc wheel để cuộn trang.'}</p>
      <div style={{ height: 340, position: 'relative', overflow: 'hidden', borderRadius: 14 }}>
        {status !== 'ready' && <img src={poster || '/poc-pavilion.svg'} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/poc-pavilion.svg'; }} alt="Ảnh thay thế cho mô hình 3D" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'absolute' }} />}
        <div ref={host} data-testid="pavilion-host" style={{ width: '100%', height: '100%', position: 'relative' }} />
      </div>
      <div aria-label="Điều khiển 3D" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <button disabled={status !== 'ready'} style={buttonStyle} onClick={() => viewer.current?.rotate(-1)}>Xoay trái</button>
        <button disabled={status !== 'ready'} style={buttonStyle} onClick={() => viewer.current?.rotate(1)}>Xoay phải</button>
        <button disabled={status !== 'ready'} style={buttonStyle} onClick={() => viewer.current?.zoom(0.8)}>Phóng to</button>
        <button disabled={status !== 'ready'} style={buttonStyle} onClick={() => viewer.current?.zoom(1.25)}>Thu nhỏ</button>
        <button disabled={status !== 'ready'} style={buttonStyle} onClick={() => viewer.current?.reset()}>Đặt lại góc nhìn</button>
        {status === 'error' && <button style={buttonStyle} onClick={() => { setOpen(false); trigger.current?.focus(); }}>Về ảnh địa điểm</button>}
      </div>
    </>}
  </section>;
}
