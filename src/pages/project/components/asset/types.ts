export type ReleaseAssetListItemType =
// markdown
  | 1
  // code
  | 2
  // attachment
  | 3;

export const ReleaseAssetListItemTypeLabel: Record<ReleaseAssetListItemType, string> = {
  1: '文档',
  2: 'SQL',
  3: '附件'
};

export type ReleaseAssetScope = 'version' | 'instance';

export interface ReleaseAssetListItem {
  filename: string;
  path: string;
  folder: string;

  file_type: ReleaseAssetListItemType
}