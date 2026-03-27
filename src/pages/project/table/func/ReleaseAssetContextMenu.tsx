import {EditIcon, DeleteIcon, InfoCircleIcon} from "tdesign-icons-vue-next";
import {isDark} from "@/global/Constants.ts";
import type {ReleaseAssetMeta} from "@/entity";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import MessageUtil from "@/util/model/MessageUtil.ts";
import {deleteReleaseAsset, updateReleaseAsset} from "@/service";
import Cxt from '@imengyu/vue3-context-menu';

export async function openReleaseAssetContextMenu(asset: ReleaseAssetMeta, event: PointerEvent, callbacks: {
  onDelete?: () => void;
  onRename?: (newName: string) => void;
}) {
  event.preventDefault();
  event.stopPropagation();

  const menuItems: any[] = [
    {
      label: '重命名',
      icon: () => <EditIcon/>,
      onClick: async () => {
        const newName = await MessageBoxUtil.prompt("请输入新文件名：", '重命名文件', {
          inputValue: asset.file_name
        });

        if (newName && newName !== asset.file_name) {
          try {
            await updateReleaseAsset(asset.id, {
              file_name: newName,
              relative_path: asset.relative_path,
              file_type: asset.file_type
            });
            asset.file_name = newName;
            MessageUtil.success("重命名成功");
            callbacks.onRename?.(newName);
          } catch (error) {
            MessageUtil.error("重命名失败", error);
          }
        }
      }
    },
    {
      label: '属性',
      icon: () => <InfoCircleIcon/>,
      onClick: async () => {
        const info = `类型: ${asset.file_type}\n名称: ${asset.file_name}\n路径: ${asset.relative_path}`;
        MessageBoxUtil.alert(info, '属性');
      }
    },
    {
      label: () => <span style={{color: 'var(--td-error-color)'}} class={'label'}>删除</span>,
      icon: () => <DeleteIcon style={{color: 'var(--td-error-color)'}}/>,
      onClick: async () => {
        try {
          await MessageBoxUtil.confirm(
            `确定要删除文件 "${asset.file_name}" 吗？`,
            '删除文件',
            {
              confirmButtonText: '删除',
              cancelButtonText: '取消'
            }
          );
          await deleteReleaseAsset(asset.id);
          MessageUtil.success("删除成功");
          callbacks.onDelete?.();
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
