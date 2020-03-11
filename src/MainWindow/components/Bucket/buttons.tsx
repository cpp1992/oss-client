import { ipcRenderer, remote } from "electron";
import React from "react";
import Button from "../BaseButton";
import Vdir from "../../lib/vdir/vdir";

type PropTypes = { vdir: Vdir };
const Buttons = ({ vdir }: PropTypes) => {
  return (
    <section className="buttons-wrapper">
      <Button
        value="上传文件"
        icon="arrow-up"
        onClick={() => {
          const userPath = remote.app.getPath("documents");
          remote.dialog
            .showOpenDialog({
              defaultPath: userPath,
              properties: ["openFile"]
            })
            .then(result => {
              if (!result.canceled) {
                result.filePaths.forEach(filPath => {
                  ipcRenderer.send(
                    "req:file:upload",
                    vdir.getPathPrefix(),
                    filPath
                  );
                });
              }
            })
            .catch(() => {});
        }}
      />
      <Button value="上传" disabled onClick={() => {}} />
      <Button value="下载" onClick={() => {}} />
      <Button value="离线下载" onClick={() => {}} />
    </section>
  );
};
export default Buttons;
