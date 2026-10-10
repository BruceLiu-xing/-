"""Import every supplied evidence image; preserve originals and generate small previews."""
from pathlib import Path
from PIL import Image, ImageOps
import hashlib, json, shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/Users/liuxing/Desktop/简历文件/业绩证明')
DEST = ROOT / 'public' / 'evidence'
CATEGORIES = [
    ('accounts', '账号后台截图', '账号与榜单', '账号主页、后台数据与平台榜单', '账号与平台记录'),
    ('brand', '星图商单截图', '星图商单', '品牌合作、推广订单与商单数据', '星图合作记录'),
    ('commerce', '视频带货截图', '视频带货', '商品成交、带货表现与佣金记录', '视频带货记录'),
    ('income', '收入证明材料', '收入证明', '不同平台的历史收益与结算记录', '平台收益记录'),
    ('teaching', '自媒体教学截图', '自媒体教学', '直播教学与内容运营实操记录', '直播教学记录'),
    ('honors', '项目截图', '项目与荣誉', '合作交流现场、平台奖杯与证书', '项目现场记录'),
]
TITLES = {
    'IMG_5597.JPG': '快手百万粉丝奖杯',
    'IMG_5594.JPG': '头条创作者纪念奖牌',
    'IMG_5599.JPG': '网易知识公路创作者证书',
    'IMG_3484.JPG': '合作交流会议现场',
    'IMG_3410.JPG': '腾讯总部交流留影',
    '科学宇宙探索.jpeg': '科学宇宙探索账号主页',
    '时空宇航号截屏.png': '时空宇航号账号主页',
    '企鹅榜单.JPG': '企鹅号平台榜单',
    '抖音榜单.PNG': '抖音账号榜单',
    '宇宙世界观截屏.png': '宇宙世界观平台后台',
}
for folder in ['originals', 'thumbnails']:
    (DEST / folder).mkdir(parents=True, exist_ok=True)
categories, grouped = [], []
for category, folder, label, description, fallback in CATEGORIES:
    files = sorted([p for p in (SOURCE / folder).iterdir() if p.suffix.lower() in {'.png','.jpeg','.jpg','.webp'}], key=lambda p:p.name.casefold())
    categories.append({'id':category,'label':label,'description':description,'count':len(files)})
    entries=[]
    for i, path in enumerate(files,1):
        digest=hashlib.sha256(path.read_bytes()).hexdigest()
        key=f'{category}-{i:02d}-{digest[:8]}'
        original=f'originals/{key}{path.suffix.lower()}'
        thumbnail=f'thumbnails/{key}.webp'
        shutil.copyfile(path,DEST/original)
        with Image.open(path) as source_image:
            image=ImageOps.exif_transpose(source_image).convert('RGB')
            width,height=image.size
            image.thumbnail((680,900))
            image.save(DEST/thumbnail,quality=86,method=5)
        entries.append({'id':key,'category':category,'title':TITLES.get(path.name,f'{fallback} {i:02d}'),'fileName':path.name,'source':str(path.relative_to(SOURCE)),'src':f'/evidence/{original}','thumbnail':f'/evidence/{thumbnail}','width':width,'height':height,'sha256':digest})
    grouped.append(entries)
# The first screen includes images from all six categories.
items=[group[i] for i in range(max(map(len,grouped))) for group in grouped if i<len(group)]
all_source_images=[p for p in SOURCE.rglob('*') if p.suffix.lower() in {'.png','.jpeg','.jpg','.webp'}]
assert {i['source'] for i in items}=={str(p.relative_to(SOURCE)) for p in all_source_images}
assert len(items)==len({i['id'] for i in items})
(ROOT/'src'/'evidence-data.json').write_text(json.dumps({'categories':categories,'items':items},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'total':len(items),'categories':categories,'all_source_images_imported':True},ensure_ascii=False))
