import {
  Form,
  FormItem,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  Select,
  Textarea,
  Tabs,
  TabPanel
} from "tdesign-vue-next";
import {platform} from "@tauri-apps/plugin-os";
import {
  addDeployScript,
  deleteDeployScript, getDeployScript,
  updateDeployScript
} from "@/service/deploy/DeployScriptService.ts";
import {
  type DeployScriptForm,
  type DeployScriptList
} from "@/entity/deploy/DeployScript.ts";
import MessageUtil from "@/util/model/MessageUtil.ts";
import MessageBoxUtil from "@/util/model/MessageBoxUtil.tsx";
import {listHost} from "@/service";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";
import NFileSelect from "@/components/native/NFileSelect.vue";

function buildDefault(data: Ref<DeployScriptForm>, hosts: Ref<{ label: string; value: string }[]>) {
  const activeTab = ref('basic');
  const localLanguage = ref(platform() === 'windows' ? 'ps1' : 'bash');
  const matchRulesInput = ref('');

  // 同步 match_rules 数组到输入框字符串
  watch(() => data.value.match_rules, (rules) => {
    matchRulesInput.value = Array.isArray(rules) ? rules.join('\n') : rules;
  }, {immediate: true});

  // 同步输入框字符串到 match_rules 数组
  const onMatchRulesChange = (val: string | number) => {
    data.value.match_rules = `${val}`.split('\n').filter(r => r.trim());
  };

  return () => {
    const tabs = [
      <TabPanel label="基本信息" value="basic">
        <Form labelAlign={'top'}>
          <FormItem label={'脚本名称'} name={'name'}
                    rules={[{required: true, message: '请输入脚本名称', type: 'error'}]}>
            <Input v-model={data.value.name} placeholder="请输入脚本名称"/>
          </FormItem>
          <FormItem label={'脚本类型'} name={'script_type'}
                    rules={[{required: true, message: '请选择脚本类型', type: 'error'}]}>
            <RadioGroup v-model={data.value.script_type} class="w-full">
              <Radio value="local">本地构建</Radio>
              <Radio value="remote">远程部署</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem label={'描述'} name={'description'}>
            <Textarea v-model={data.value.description} placeholder="请输入脚本描述（可选）"
                      autosize={{minRows: 2, maxRows: 4}}/>
          </FormItem>
        </Form>
      </TabPanel>,
      <TabPanel label="本地配置" value="local">
        <Form labelAlign={'top'}>
          <FormItem label={'工作目录'} name={'local_work_dir'}
                    rules={data.value.script_type === 'local' ? [{
                      required: true,
                      message: '请输入本地工作目录',
                      type: 'error'
                    }] : []}>
            <NFileSelect v-model={data.value.local_work_dir} placeholder="请输入本地工作目录路径" directory={true}/>
          </FormItem>
          <FormItem label={'构建命令'} name={'local_commands'}>
            <div class={'h-200px w-full'}>
              <MonacoEditor v-model={data.value.local_commands} language={localLanguage.value}/>
            </div>
          </FormItem>
          <FormItem label={'输出目录'} name={'build_output_dir'}>
            <NFileSelect v-model={data.value.build_output_dir} placeholder="请输入构建输出目录路径" directory={true}/>
          </FormItem>
          <FormItem label={'文件过滤'}>
            <div style="display: flex; flex-direction: column; gap: 12px">
              {/* 扫描深度 */}
              <div>
                <div style="font-size: 12px; color: var(--td-text-color-secondary); margin-bottom: 8px;">扫描深度</div>
                <RadioGroup v-model={data.value.scan_depth} class="w-full">
                  <Radio value="shallow">当前目录</Radio>
                  <Radio value="deep">递归子目录</Radio>
                </RadioGroup>
              </div>
              {/* 匹配模式 */}
              <div>
                <div style="font-size: 12px; color: var(--td-text-color-secondary); margin-bottom: 8px;">匹配模式</div>
                <RadioGroup v-model={data.value.match_mode} class="w-full">
                  <Radio value="all">全部文件</Radio>
                  <Radio value="include">仅包含</Radio>
                  <Radio value="exclude">排除指定</Radio>
                </RadioGroup>
              </div>
              {/* 匹配规则 */}
              {data.value.match_mode !== 'all' && (
                <div>
                  <div style="font-size: 12px; color: var(--td-text-color-secondary); margin-bottom: 8px;">
                    {data.value.match_mode === 'include' ? '包含规则' : '排除规则'}
                    <span style="margin-left: 4px; color: var(--td-text-color-placeholder);">（每行一条，支持 glob 模式）</span>
                  </div>
                  <Textarea v-model={matchRulesInput.value} onChange={onMatchRulesChange}
                         placeholder="例如: *.js"
                         autosize={{minRows: 3, maxRows: 6}}/>
                </div>
              )}
            </div>
          </FormItem>
        </Form>
      </TabPanel>,
      <TabPanel label="传输配置" value="transfer">
        <Form labelAlign={'top'}>
          {data.value.script_type === 'remote' && (
            <FormItem label={'目标主机'} name={'target_host_id'}>
              <Select
                v-model={data.value.target_host_id}
                placeholder="请选择目标主机（不选则本地执行）"
                options={hosts.value}
                filterable
                clearable
              />
            </FormItem>
          )}
          <FormItem label={'目标目录'} name={'target_dir'}>
            {data.value.script_type === 'remote' ?
              (<Input v-model={data.value.target_dir} placeholder="请输入远程部署目录路径"/>) :
              (<NFileSelect v-model={data.value.target_dir} placeholder="请输入本地部署目录路径" directory={true}/>)}
          </FormItem>
        </Form>
      </TabPanel>,
      <TabPanel label="远程配置" value="remote" disabled={data.value.script_type !== 'remote'}>
        <Form labelAlign={'top'}>
          <FormItem label={'部署路径'} name={'deploy_path'}
                    rules={data.value.script_type === 'remote' ? [{
                      required: true,
                      message: '请输入部署路径',
                      type: 'error'
                    }] : []}>
            <Input v-model={data.value.deploy_path} placeholder="请输入远程部署路径"/>
          </FormItem>
          <FormItem label={'版本保留数'} name={'keep_versions'} help={'保留版本数量，0 表示不限制'}>
            <InputNumber v-model={data.value.keep_versions} min={0} max={999}/>
          </FormItem>
          <FormItem label={'部署前命令'} name={'pre_deploy_commands'}>
            <div class={'h-200px w-full'}>
              <MonacoEditor v-model={data.value.pre_deploy_commands} language={localLanguage.value}/>
            </div>
          </FormItem>
          <FormItem label={'部署后命令'} name={'post_deploy_commands'}>
            <div class={'h-200px w-full'}>
              <MonacoEditor v-model={data.value.post_deploy_commands} language={localLanguage.value}/>
            </div>
          </FormItem>
        </Form>
      </TabPanel>,
    ];

    return (
      <div>
        <Tabs v-model={activeTab.value} theme="normal">
          {tabs}
        </Tabs>
      </div>
    );
  };
}

export function addScript(projectId: string, instanceId: string, onUpdate: () => void) {
  const data = ref<DeployScriptForm>({
    name: '',
    script_type: 'remote',
    description: '',
    local_work_dir: '',
    local_commands: '',
    build_output_dir: '',
    scan_depth: 'shallow',
    match_mode: 'all',
    match_rules: [],
    target_host_id: '',
    target_dir: '',
    keep_versions: 0,
    deploy_path: '',
    pre_deploy_commands: '',
    post_deploy_commands: '',
  });
  const hosts = ref<{ label: string; value: string }[]>([]);

  listHost().then(list => {
    hosts.value = list.map(h => ({label: h.name, value: h.id}));
  });

  const dp = DrawerPlugin({
    header: '新增脚本',
    size: '700px',
    default: buildDefault(data, hosts),
    closeOnEscKeydown: false,
    drawerClassName: 'pim-script-drawer',
    onConfirm: () => {
      addDeployScript(projectId, instanceId, data.value)
        .then(() => {
          onUpdate();
          MessageUtil.success("新增成功");
          dp.destroy?.();
        }).catch(e => {
        MessageUtil.error("新增失败", e);
      })
    }
  })
}

export async function updateScript(old: DeployScriptList, onUpdate: () => void) {
  const o = await getDeployScript(old.id);
  if (!o) return MessageUtil.error("系统异常，脚本未找到");
  const data = ref<DeployScriptForm>(o);
  const hosts = ref<{ label: string; value: string }[]>([]);

  listHost().then(list => {
    hosts.value = list.map(h => ({label: h.name, value: h.id}));
  });

  const dp = DrawerPlugin({
    header: '修改脚本',
    size: '700px',
    default: buildDefault(data, hosts),
    closeOnEscKeydown: false,
    drawerClassName: 'pim-script-drawer',
    onConfirm: () => {
      updateDeployScript(old.id, data.value)
        .then(() => {
          onUpdate();
          MessageUtil.success("修改成功");
          dp.destroy?.();
        }).catch(e => {
        MessageUtil.error("修改失败", e);
      })
    }
  })
}

export function deleteScript(id: string, onUpdate: () => void) {
  MessageBoxUtil.confirm("是否删除此脚本", "删除脚本").then(() => {
    deleteDeployScript(id)
      .then(() => {
        onUpdate();
        MessageUtil.success("删除成功");
      }).catch(e => {
      MessageUtil.error("删除失败", e);
    })
  })
}
