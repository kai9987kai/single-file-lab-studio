/**
 * Spec generator: converts a JSON "lab spec" into HTML controls + JS wiring.
 */
export interface LabSpecControl {
    id: string;
    type: 'text' | 'number' | 'range' | 'select' | 'checkbox' | 'color' | 'textarea';
    label: string;
    default?: string | number | boolean;
    min?: number;
    max?: number;
    step?: number;
    options?: {
        label: string;
        value: string;
    }[];
    placeholder?: string;
}
export interface LabSpec {
    title: string;
    description?: string;
    controls: LabSpecControl[];
    darkTheme?: boolean;
    includePresetManager?: boolean;
    includeExportButtons?: boolean;
}
export declare function validateSpec(json: string): {
    valid: boolean;
    spec?: LabSpec;
    error?: string;
};
export declare function generateControlsHTML(controls: LabSpecControl[]): string;
//# sourceMappingURL=specGenerator.d.ts.map