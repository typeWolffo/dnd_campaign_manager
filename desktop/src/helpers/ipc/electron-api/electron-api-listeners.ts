import {
  ipcMain,
  dialog,
  OpenDialogOptions as ElectronOpenDialogOptions,
} from "electron";

interface OpenDialogOptions {
  properties: string[];
  title: string;
}

export function addElectronAPIListeners() {
  ipcMain.handle(
    "show-open-dialog",
    async (event, options: OpenDialogOptions) => {
      const result = await dialog.showOpenDialog({
        properties:
          options.properties as ElectronOpenDialogOptions["properties"],
        title: options.title,
      });

      return result;
    },
  );
}
