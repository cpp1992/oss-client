import React, { useEffect, useState } from "react";
import FileDrop from "react-file-drop";
import { ipcRenderer, remote } from "electron";

import "./index.scss";
import HeaderToolbar from "./HeaderToolbar";
import BodyTable from "./BodyTable";
import { Layout } from "../../types";
import BodyGrid from "./BodyGrid";
import Footer from "./Footer";
import HeaderButtonGroup from "./HeaderButtonGroup";
import VFolder from "../../lib/vdir/VFolder";
import { switchBucket } from "../../ipc";
import { qiniuAdapter } from "../../lib/adapter/qiniu";
import { Item } from "../../lib/vdir/types";
import VFile from "../../lib/vdir/VFile";
import { fileContextMenu } from "../../helper/contextMenu";

type PropTypes = {
  bucket: string;
  onLoadedBucket: () => void;
};

const Bucket = ({ bucket, onLoadedBucket }: PropTypes) => {
  const [vFolder, setVFolder] = useState<VFolder>(new VFolder("root"));
  const [layout, setLayout] = useState<Layout>(Layout.grid);
  const [domains, setDomains] = useState<string[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!bucket) return;
    switchBucket(bucket).then(bucketIpcRep => {
      const adaptedFiles = qiniuAdapter(bucketIpcRep.files);
      const vf = VFolder.from(adaptedFiles);
      onLoadedBucket();
      setDomains(bucketIpcRep.domains);
      setVFolder(vf);
      setItems(vf.listFiles());
    });
  }, [bucket]);

  const fileUpload = () => {
    // todo: 记录上次打开文件夹
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
              vFolder.getPathPrefix(),
              filPath
            );
          });
        }
      })
      .catch(() => {});
  };
  const backspace = () => {
    vFolder.back();
  };
  const onFileDrop = (files: FileList | null) => {
    if (files) {
      const filePaths: string[] = [];
      for (let i = 0; i < files.length; i += 1) {
        filePaths.push(files[i].path);
      }
      ipcRenderer.send("drop-files", vFolder.getPathPrefix(), filePaths);
    }
  };
  const onFileContextMenu = (item: VFile) => {
    fileContextMenu(item, domains[0]);
  };
  const onFolderSelect = (name: string) => {
    vFolder.changeDir(name);
    setItems(vFolder.listFiles());
  };
  const onFolderContextMenu = (item: VFolder) => {};

  return (
    <div className="bucket-wrapper">
      <HeaderButtonGroup fileUpload={fileUpload} />
      <HeaderToolbar
        backspace={backspace}
        layout={layout}
        changeLayout={() => {
          if (layout === Layout.grid) {
            setLayout(Layout.table);
          } else {
            setLayout(Layout.grid);
          }
        }}
        navigators={vFolder.getNav()}
      />
      {bucket ? (
        <div className="content-wrapper">
          <FileDrop onDrop={onFileDrop} />
          {Layout.grid === layout ? (
            <BodyGrid
              domains={[]}
              items={items}
              onFolderSelect={onFolderSelect}
              onFolderContextMenu={onFolderContextMenu}
              onFileSelect={() => {}}
              onFileContextMenu={onFileContextMenu}
            />
          ) : (
            <BodyTable
              items={items}
              onFolderSelect={onFolderSelect}
              onFolderContextMenu={onFolderContextMenu}
              onFileSelect={() => {}}
              onFileContextMenu={onFileContextMenu}
            />
          )}
        </div>
      ) : (
        <div className="content-wrapper">
          <div className="no-files">
            <div className="title">没有选中</div>
            <div className="sub-title">当前没有选中 bucket</div>
          </div>
        </div>
      )}
      <Footer
        totalItem={vFolder.getTotalItem()}
        selectedItem={0}
        domains={domains}
      />
    </div>
  );
};

export default Bucket;
