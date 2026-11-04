import { config, collection, singleton, fields } from '@keystatic/core';

/**
 * Case-study admin. Open /keystatic.
 * - Local dev (`npm run dev`): edits are written straight to files in this repo.
 * - Production: sign in with GitHub; saving commits to the repo and Vercel redeploys.
 *   See README → "Keystatic GitHub 模式" for the one-time GitHub App setup.
 */
// Set PUBLIC_KEYSTATIC_GITHUB=true locally once to run the GitHub App setup wizard.
const useGithub = import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_GITHUB === 'true';

const bi = (label: string, opts: { multiline?: boolean; required?: boolean } = {}) =>
  fields.object(
    {
      zh: fields.text({ label: `${label}（中文）`, multiline: opts.multiline, validation: opts.required ? { isRequired: true } : undefined }),
      en: fields.text({ label: `${label}（English）`, multiline: opts.multiline }),
    },
    { label, layout: [6, 6] },
  );

const img = (label: string) =>
  fields.image({ label, directory: 'src/assets/projects', publicPath: '../../assets/projects/', validation: { isRequired: true } });

const category = (label: string, dir: string) =>
  collection({
    label,
    slugField: 'name',
    path: `src/content/${dir}/*`,
    format: { data: 'yaml' },
    columns: ['name', 'zh'],
    schema: {
      name: fields.slug({ name: { label: 'English name', validation: { isRequired: true } } }),
      zh: fields.text({ label: '中文名称', validation: { isRequired: true } }),
      order: fields.integer({ label: '排序（小的在前）', defaultValue: 0 }),
    },
  });

export default config({
  storage: useGithub
    ? { kind: 'github', repo: { owner: 'shenjiu9', name: 'personal-website' } }
    : { kind: 'local' },
  ui: {
    brand: { name: 'vlas. admin' },
    navigation: {
      案例: ['projects'],
      分类: ['fields', 'platforms', 'industries', 'projectTypes'],
      站点: ['settings'],
    },
  },
  collections: {
    projects: collection({
      label: '案例 Projects',
      slugField: 'internalName',
      path: 'src/content/projects/*',
      format: { data: 'yaml' },
      columns: ['internalName', 'year', 'status'],
      entryLayout: 'form',
      schema: {
        internalName: fields.slug({
          name: { label: '内部名称（只在后台显示）', validation: { isRequired: true } },
          slug: { label: 'URL 标识', description: '例如 kiln-ceramics-rebrand' },
        }),
        status: fields.select({
          label: '状态',
          options: [
            { label: '已发布', value: 'published' },
            { label: '草稿（前台不显示）', value: 'draft' },
          ],
          defaultValue: 'draft',
        }),
        featured: fields.checkbox({ label: '首页精选', defaultValue: false }),
        order: fields.integer({ label: '排序（小的在前）', defaultValue: 10 }),
        title: bi('项目名称', { required: true }),
        summary: bi('一句话概述', { required: true, multiline: true }),
        client: fields.text({ label: '客户' }),
        year: fields.integer({ label: '年份', defaultValue: new Date().getFullYear() }),
        role: bi('我的角色'),
        services: fields.array(bi('服务内容'), { label: '服务内容', itemLabel: (p) => p.fields.zh.value || '服务' }),
        liveUrl: fields.url({ label: '线上链接' }),
        cover: img('封面图（建议 16:10，或 4:5 竖图）'),
        coverPortrait: fields.checkbox({ label: '封面是竖图（4:5）', defaultValue: false }),
        hero: img('主视觉（全宽，建议 16:9）'),
        heroVideo: fields.file({ label: '主视觉视频（可选，MP4 < 4MB，静音循环）', directory: 'public/videos', publicPath: '/videos/' }),
        challenge: bi('挑战', { multiline: true }),
        solution: bi('方案', { multiline: true }),
        result: bi('结果', { multiline: true }),
        fields: fields.multiRelationship({ label: '设计领域', collection: 'fields' }),
        platforms: fields.multiRelationship({ label: '平台 / 媒介', collection: 'platforms' }),
        industries: fields.multiRelationship({ label: '行业', collection: 'industries' }),
        projectTypes: fields.multiRelationship({ label: '项目性质', collection: 'projectTypes' }),
        body: fields.blocks(
          {
            section: {
              label: '章节（标题 + 正文）',
              itemLabel: (p) => `章节 · ${p.fields.heading.fields.zh.value}`,
              schema: fields.object({
                heading: bi('章节标题'),
                text: bi('正文（空行分段）', { multiline: true }),
              }),
            },
            fullImage: {
              label: '全宽单图',
              schema: fields.object({ image: img('图片'), caption: bi('图注') }),
            },
            twoUp: {
              label: '左右双图',
              schema: fields.object({ left: img('左图'), right: img('右图'), caption: bi('图注') }),
            },
            threeUp: {
              label: '三列小图',
              schema: fields.object({ a: img('图 1'), b: img('图 2'), c: img('图 3'), caption: bi('图注') }),
            },
            textImage: {
              label: '图文左右排',
              schema: fields.object({
                image: img('图片'),
                text: bi('文字', { multiline: true }),
                imageSide: fields.select({
                  label: '图片位置',
                  options: [
                    { label: '左', value: 'left' },
                    { label: '右', value: 'right' },
                  ],
                  defaultValue: 'right',
                }),
              }),
            },
            quote: {
              label: '客户评价',
              schema: fields.object({ text: bi('评价内容', { multiline: true }), author: fields.text({ label: '署名' }) }),
            },
          },
          { label: '正文' },
        ),
      },
    }),
    fields: category('设计领域', 'fields'),
    platforms: category('平台 / 媒介', 'platforms'),
    industries: category('行业', 'industries'),
    projectTypes: category('项目性质', 'project-types'),
  },
  singletons: {
    settings: singleton({
      label: '站点设置',
      path: 'src/content/settings/site',
      format: { data: 'yaml' },
      schema: {
        email: fields.text({ label: '邮箱', validation: { isRequired: true } }),
        available: fields.checkbox({ label: '目前可接项目', defaultValue: true }),
        location: bi('所在地'),
        about: bi('关于页介绍（空行分段）', { multiline: true }),
        services: fields.array(
          fields.object({ title: bi('服务名称'), description: bi('一句话说明') }),
          { label: '服务列表', itemLabel: (p) => p.fields.title.fields.zh.value },
        ),
        experience: fields.array(
          fields.object({ period: fields.text({ label: '时间' }), company: fields.text({ label: '公司 / 组织' }), role: bi('职位') }),
          { label: '经历', itemLabel: (p) => `${p.fields.period.value} ${p.fields.company.value}` },
        ),
        clients: fields.array(
          fields.object({
            name: fields.text({ label: '客户名称' }),
            logo: fields.image({ label: 'Logo（可选，单色 SVG/PNG）', directory: 'src/assets/clients', publicPath: '../../assets/clients/' }),
          }),
          { label: '客户', itemLabel: (p) => p.fields.name.value },
        ),
        socials: fields.array(
          fields.object({ label: fields.text({ label: '名称' }), url: fields.url({ label: '链接' }) }),
          { label: '社交链接', itemLabel: (p) => p.fields.label.value },
        ),
        resume: fields.file({ label: '简历 PDF', directory: 'public/files', publicPath: '/files/' }),
      },
    }),
  },
});
