export default function Footer() {
  return (
    <footer style={{ background: '#0A0A0A', borderTop: '1px solid rgba(255,255,255,0.07)', padding: '40px 32px' }}>
      <div className="page-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '18px', fontWeight: 900, color: '#00D2BE', letterSpacing: '0.06em' }}>
            F1 GUIDE
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9BA8A5', marginTop: '6px', lineHeight: 1.5, whiteSpace: 'nowrap' }}>
            赛事数据 · 深度科普 · 车队情报 · 车迷社区
          </p>
        </div>
        <div>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            {['隐私政策', '服务条款', '联系我们', 'Cookie 设置'].map(text => (
              <a key={text} href="#" style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#9BA8A5', textDecoration: 'none' }}
                onMouseOver={e => e.currentTarget.style.color = '#fff'}
                onMouseOut={e => e.currentTarget.style.color = '#9BA8A5'}
              >{text}</a>
            ))}
          </div>
          <div style={{ fontFamily: 'var(--font-title)', fontSize: '11px', letterSpacing: '0.1em', color: '#444', marginTop: '8px' }}>
            © 2026 F1 GUIDE · 技术驱动，精密至上
          </div>
        </div>
      </div>
    </footer>
  )
}
