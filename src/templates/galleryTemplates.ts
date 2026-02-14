/**
 * Template Gallery for Single-File Lab Studio.
 * Contains definitions for data visualizer, game loop, and other presets.
 */

export interface LabTemplate {
    id: string;
    name: string;
    description: string;
    scripts?: string[];
    injectHtml?: { [selector: string]: string };
    injectJs?: string;
}

export const TEMPLATES: { [id: string]: LabTemplate } = {
    'visualizer': {
        id: 'visualizer',
        name: '📈 Data Visualizer',
        description: 'Built-in Chart.js integration and CSV parser.',
        scripts: ['https://cdn.jsdelivr.net/npm/chart.js'],
        injectHtml: {
            '#outputCanvas': '<canvas id="myChart" style="width:100%; height:300px;"></canvas>'
        },
        injectJs: `
  // ─── Chart Initialization ──────────────────────────────
  Lab.render = function() {
    const ctx = document.getElementById('myChart')?.getContext('2d');
    if (!ctx) return;
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
          label: 'Lab Data',
          data: [12, 19, 3, 5, 2, 3].map(v => v * (this.state.sampleRange / 50)),
          backgroundColor: 'rgba(88, 166, 255, 0.5)',
          borderColor: 'rgba(88, 166, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  };`
    },
    'game': {
        id: 'game',
        name: '🕹️ Game Loop',
        description: 'Canvas setup with delta-time loop and input hooks.',
        injectHtml: {
            '#outputCanvas': '<canvas id="gameCanvas" width="800" height="400" style="background:#000; width:100%; height:300px; border-radius:4px;"></canvas>'
        },
        injectJs: `
  // ─── Game Loop ──────────────────────────────────────────
  Lab.render = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    let x = 0;
    
    const animate = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = this.state.sampleToggle ? '#3fb950' : '#f85149';
      
      const speed = this.state.sampleRange / 5;
      x = (x + speed) % canvas.width;
      
      ctx.fillRect(x, 180, 80, 40);
      this.frame = requestAnimationFrame(animate);
    };
    
    if (this.frame) cancelAnimationFrame(this.frame);
    animate(0);
  };`
    },
    'dashboard': {
        id: 'dashboard',
        name: '📊 Analytics Dashboard',
        description: 'Multi-grid layout with stat cards and real-time updates.',
        injectHtml: {
            '#outputCanvas': '<div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:15px; width:100%;"><div class="lab-controls" style="margin:0; text-align:center;"><div style="font-size:24px; font-weight:700; color:var(--accent);" id="stat1">0</div><div style="font-size:12px; color:var(--text-muted);">Active Users</div></div><div class="lab-controls" style="margin:0; text-align:center;"><div style="font-size:24px; font-weight:700; color:var(--success);" id="stat2">0%</div><div style="font-size:12px; color:var(--text-muted);">Uptime</div></div><div class="lab-controls" style="grid-column: span 2; margin:0;" id="gridOutput"><div style="height:100px; background:var(--surface); border:1px dashed var(--border); border-radius:4px; display:flex; align-items:center; justify-content:center;">Main Content Area</div></div></div>'
        },
        injectJs: `
  // ─── Dashboard Logic ────────────────────────────────────
  Lab.render = function() {
    document.getElementById('stat1').textContent = Math.floor(this.state.sampleRange * 2.5);
    document.getElementById('stat2').textContent = this.state.sampleToggle ? '99.9%' : '0%';
    const grid = document.getElementById('gridOutput');
    if (grid) {
      grid.style.borderColor = this.state.sampleToggle ? 'var(--success)' : 'var(--danger)';
    }
  };`
    }
};
