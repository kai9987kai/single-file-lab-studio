"use strict";
/**
 * Spec generator: converts a JSON "lab spec" into HTML controls + JS wiring.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSpec = validateSpec;
exports.generateControlsHTML = generateControlsHTML;
function validateSpec(json) {
    try {
        const spec = JSON.parse(json);
        if (!spec.title || typeof spec.title !== 'string') {
            return { valid: false, error: 'Missing or invalid "title" field.' };
        }
        if (!Array.isArray(spec.controls)) {
            return { valid: false, error: 'Missing or invalid "controls" array.' };
        }
        for (const ctrl of spec.controls) {
            if (!ctrl.id || !ctrl.type || !ctrl.label) {
                return { valid: false, error: `Control missing required fields (id, type, label): ${JSON.stringify(ctrl)}` };
            }
        }
        return { valid: true, spec };
    }
    catch (e) {
        return { valid: false, error: `JSON parse error: ${e.message}` };
    }
}
function generateControlsHTML(controls) {
    return controls.map(ctrl => {
        switch (ctrl.type) {
            case 'text':
                return `        <div class="control-group">
          <label for="${ctrl.id}">${esc(ctrl.label)}</label>
          <input type="text" id="${ctrl.id}" value="${esc(String(ctrl.default ?? ''))}" placeholder="${esc(ctrl.placeholder ?? '')}" />
        </div>`;
            case 'number':
                return `        <div class="control-group">
          <label for="${ctrl.id}">${esc(ctrl.label)}</label>
          <input type="number" id="${ctrl.id}" value="${ctrl.default ?? 0}" min="${ctrl.min ?? ''}" max="${ctrl.max ?? ''}" step="${ctrl.step ?? 1}" />
        </div>`;
            case 'range':
                return `        <div class="control-group">
          <label for="${ctrl.id}">${esc(ctrl.label)}</label>
          <input type="range" id="${ctrl.id}" value="${ctrl.default ?? 50}" min="${ctrl.min ?? 0}" max="${ctrl.max ?? 100}" step="${ctrl.step ?? 1}" />
          <span class="range-value" id="${ctrl.id}Value">${ctrl.default ?? 50}</span>
        </div>`;
            case 'select':
                const opts = (ctrl.options || [])
                    .map(o => `<option value="${esc(o.value)}"${o.value === String(ctrl.default) ? ' selected' : ''}>${esc(o.label)}</option>`)
                    .join('\n            ');
                return `        <div class="control-group">
          <label for="${ctrl.id}">${esc(ctrl.label)}</label>
          <select id="${ctrl.id}">
            ${opts}
          </select>
        </div>`;
            case 'checkbox':
                return `        <div class="control-group">
          <label>
            <input type="checkbox" id="${ctrl.id}" ${ctrl.default ? 'checked' : ''} />
            ${esc(ctrl.label)}
          </label>
        </div>`;
            case 'color':
                return `        <div class="control-group">
          <label for="${ctrl.id}">${esc(ctrl.label)}</label>
          <input type="color" id="${ctrl.id}" value="${ctrl.default ?? '#58a6ff'}" />
        </div>`;
            case 'textarea':
                return `        <div class="control-group">
          <label for="${ctrl.id}">${esc(ctrl.label)}</label>
          <textarea id="${ctrl.id}" rows="4" placeholder="${esc(ctrl.placeholder ?? '')}">${esc(String(ctrl.default ?? ''))}</textarea>
        </div>`;
            default:
                return `        <!-- Unknown control type: ${ctrl.type} -->`;
        }
    }).join('\n');
}
function esc(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
//# sourceMappingURL=specGenerator.js.map