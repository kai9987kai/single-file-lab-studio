/**
 * Base single-file app template generator.
 * Produces a complete, self-contained HTML file with embedded CSS + JS.
 */
export interface AppOptions {
    title: string;
    includePresetManager: boolean;
    includeExportButtons: boolean;
    darkTheme: boolean;
}
export declare function generateBaseApp(options: AppOptions): string;
//# sourceMappingURL=baseApp.d.ts.map