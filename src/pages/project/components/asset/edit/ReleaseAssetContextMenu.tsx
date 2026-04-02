import {EditIcon, DeleteIcon} from "tdesign-icons-vue-next";
import {isDark} from "@/global/Constants.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import Cxt from '@imengyu/vue3-context-menu';
import type {ReleaseAssetListItem} from "@/pages/project/components/asset/types.ts";
import {deleteAssetItem, renameAsset} from "@/pages/project/components/asset/func.tsx";

export async function openReleaseAssetContextMenu(asset: ReleaseAssetListItem, event: PointerEvent, onUpdate: () => void) {
  event.preventDefault();
  event.stopPropagation();

  const menuItems: any[] = [
    {
      label: '重命名',
      icon: () => <EditIcon/>,
      onClick: async () => {
        const newName = await MessageBoxUtil.prompt("请输入新文件名：", '重命名文件', {
          inputValue: asset.filename
        });

        if (newName && newName !== asset.filename) {
          try {
            await renameAsset({
              ...asset,
              filename: newName
            });
            MessageUtil.success("重命名成功");
            onUpdate();
          } catch (error) {
            MessageUtil.error("重命名失败", error);
          }
        }
      }
    },
    {
      label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
      icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
      onClick: async () => {
        try {
          await MessageBoxUtil.confirm(
            `确定要删除文件 "${asset.filename}" 吗？`,
            '删除文件',
            {
              confirmButtonText: '删除',
              cancelButtonText: '取消'
            }
          );
          deleteAssetItem(asset, () => onUpdate());
        } catch (error) {
          if (error !== 'cancel') {
            MessageUtil.error("删除失败", error);
          }
        }
      }
    }
  ];

  Cxt.showContextMenu({
    x: event.x,
    y: event.y,
    theme: isDark.value ? 'mac dark' : 'mac',
    items: menuItems
  });
}
