export type Concept = { id:string; name:string; en:string; type:string; description:string; example:string; sources:string[]; warm?:boolean };
export type Relation = { id:string; from:string; to:string; label:string; kind:'class'|'use'|'flow'; bend?:number };
export const sources:Record<string,{title:string;url:string}> = {
 aima:{title:'Artificial Intelligence: A Modern Approach · 第 1 章',url:'https://aima.cs.berkeley.edu/newchap01.pdf'},
 dl:{title:'Deep Learning · 第 1 章',url:'https://www.deeplearningbook.org/contents/intro.html'},
 transformer:{title:'Attention Is All You Need',url:'https://arxiv.org/abs/1706.03762'},
 gpt3:{title:'Language Models are Few-Shot Learners · GPT-3',url:'https://arxiv.org/abs/2005.14165'},
 vit:{title:'An Image is Worth 16×16 Words · ViT',url:'https://arxiv.org/abs/2010.11929'},
};
export const data:Concept[] = [
 {id:'ai',name:'人工智能',en:'ARTIFICIAL INTELLIGENCE',type:'研究领域',description:'研究如何让机器完成感知、推理、学习和行动等任务。',example:'下棋可以用搜索；识别图片可以用深度学习。',sources:['aima']},
 {id:'ml',name:'机器学习',en:'MACHINE LEARNING',type:'AI 的研究分支',description:'从数据或经验中学习，使模型在任务上的表现得到改善。',example:'给模型看带标签的邮件，学习区分垃圾邮件和正常邮件。',sources:['aima','dl']},
 {id:'nn',name:'神经网络',en:'NEURAL NETWORKS',type:'模型家族',description:'由相互连接的计算单元和可学习参数构成，可以有较浅或较深的结构。',example:'浅层全连接网络和深层卷积网络都属于神经网络。',sources:['dl']},
 {id:'dl',name:'深度学习',en:'DEEP LEARNING',type:'机器学习方法',description:'学习多层表示，通常通过训练深层神经网络实现。',example:'图像识别中，多层网络可以逐步学到边缘、局部形状和类别信息。',sources:['dl'],warm:true},
 {id:'deepnn',name:'深层神经网络',en:'DEEP NEURAL NETWORK',type:'神经网络的一类',description:'通过多层计算组合表示的神经网络，是深度学习中主要使用的模型。',example:'图中的输入层、多个隐藏层和输出层，是一种简化的全连接网络示意。',sources:['dl'],warm:true},
 {id:'tree',name:'决策树',en:'DECISION TREE',type:'模型家族',description:'通过一系列条件判断作出预测；树的划分条件可以从数据中学习。',example:'根据邮件是否含可疑链接、发件人是否陌生等特征判断垃圾邮件。',sources:['aima','dl']},
 {id:'symbolic',name:'规则与搜索',en:'RULES & SEARCH',type:'AI 方法示例',description:'使用规则、逻辑推理或搜索策略求解问题。这些方法也能与机器学习结合。',example:'在棋局中搜索候选走法，比较可能的后续结果。',sources:['aima']},
 {id:'transformer',name:'Transformer',en:'TRANSFORMER',type:'神经网络架构',description:'以注意力机制为核心组织信息处理的神经网络架构，可用于语言和视觉等任务。',example:'GPT-3 用它处理文本；ViT 用它处理图像。',sources:['transformer','gpt3','vit'],warm:true},
 {id:'llm',name:'大语言模型',en:'LARGE LANGUAGE MODEL',type:'模型类别',description:'在大量文本上训练的语言模型，可根据上下文生成文本。',example:'GPT-3 是采用 Transformer 架构的大语言模型。',sources:['gpt3'],warm:true},
 {id:'vision',name:'视觉任务',en:'VISION TASKS',type:'任务类别',description:'处理图像或视频中的信息，包括分类、检测和分割等任务。',example:'ViT 将图像切成小块，再使用 Transformer 进行图像分类。',sources:['vit']},
 {id:'agent',name:'智能体',en:'AGENT',type:'系统',description:'通过观察环境、作出决策和采取行动来完成任务的系统；可以采用规则、搜索或学习得到的模型。',example:'网页助手读取页面、选择操作并检查结果；其中的决策可以使用 LLM。',sources:['aima']},
 {id:'tools',name:'工具',en:'TOOLS',type:'可调用的外部能力',description:'系统可调用的搜索、计算或文件操作等能力。调用结果可以作为后续决策的输入。',example:'网页助手调用搜索接口，再读取返回的网页信息。',sources:['aima']},
 {id:'environment',name:'环境',en:'ENVIRONMENT',type:'观察和行动的对象',description:'智能体从中获得观察、并对其采取行动的对象，可以是网页、软件或物理世界。',example:'对网页助手而言，页面内容是观察，点击按钮是行动。',sources:['aima']},
];
export const relations:Relation[] = [
 {id:'ml-ai',from:'ml',to:'ai',label:'属于',kind:'class'},
 {id:'dl-ml',from:'dl',to:'ml',label:'属于',kind:'class'},
 {id:'symbolic-ai',from:'symbolic',to:'ai',label:'属于 AI 方法',kind:'class',bend:-7},
 {id:'ml-nn',from:'ml',to:'nn',label:'可采用',kind:'use'},
 {id:'ml-tree',from:'ml',to:'tree',label:'可采用',kind:'use'},
 {id:'deepnn-nn',from:'deepnn',to:'nn',label:'是一类',kind:'class'},
 {id:'dl-deepnn',from:'dl',to:'deepnn',label:'通常使用',kind:'use'},
 {id:'tf-nn',from:'transformer',to:'nn',label:'是一种架构',kind:'class'},
 {id:'llm-tf',from:'llm',to:'transformer',label:'可采用',kind:'use'},
 {id:'tf-vision',from:'transformer',to:'vision',label:'可用于',kind:'use'},
 {id:'agent-llm',from:'agent',to:'llm',label:'可使用',kind:'use'},
 {id:'agent-tools',from:'agent',to:'tools',label:'可调用',kind:'use'},
 {id:'agent-environment',from:'agent',to:'environment',label:'行动',kind:'flow',bend:7},
 {id:'environment-agent',from:'environment',to:'agent',label:'观察',kind:'flow',bend:7},
];
export const stageRelations = [
 ['ml-ai','dl-ml','symbolic-ai','ml-nn','tf-nn','llm-tf','agent-llm'],
 ['dl-ml','ml-nn','ml-tree'],
 ['deepnn-nn','dl-deepnn'],
 ['tf-nn','llm-tf','tf-vision'],
 ['agent-llm','agent-tools','agent-environment','environment-agent'],
];
export const chapters = [
 {title:'人工智能',type:'研究领域',intro:data[0].description,example:data[0].example,summary:['ml-ai','dl-ml','agent-llm'],sources:['aima','dl']},
 {title:'机器学习',type:'学习方法与模型',intro:'机器学习可以采用不同模型；深度学习是其中的一类学习方法。',example:'同一个邮件分类任务，可以尝试决策树，也可以尝试神经网络。',summary:stageRelations[1],sources:['aima','dl']},
 {title:'神经网络与深度学习',type:'模型与学习方法',intro:'神经网络描述模型结构，深度学习描述学习多层表示的方法。',example:'图中示意一个多层全连接网络；它只是深层神经网络的一种结构。',summary:stageRelations[2],sources:['dl']},
 {title:'Transformer 与 LLM',type:'架构、模型与任务',intro:'Transformer 是架构；大语言模型是一类模型。相同架构也可用于视觉任务。',example:'GPT-3 处理文本，ViT 处理图像，两者都采用 Transformer 架构。',summary:stageRelations[3],sources:['transformer','gpt3','vit']},
 {title:'智能体',type:'系统与环境',intro:'智能体从环境获得观察，作出决策，再通过行动影响环境。LLM 和工具是它可以使用的部分。',example:'网页助手：读取页面 → 决定操作 → 点击按钮 → 读取新页面。',summary:stageRelations[4],sources:['aima']},
];
export const desktop:Record<string,number[]>[] = [
 {ai:[-.72,.75],ml:[-.10,.75],dl:[.56,.75],symbolic:[-.72,-.02],nn:[-.10,-.02],transformer:[.57,-.02],agent:[-.52,-.82],llm:[.35,-.82]},
 {ml:[-.06,.69],nn:[-.67,-.28],tree:[.67,-.28],dl:[.64,.78]},
 {nn:[-.65,.76],dl:[.65,.76],deepnn:[0,-.90]},
 {nn:[-.65,.76],transformer:[-.13,-.02],llm:[.63,-.77],vision:[.63,.76]},
 {agent:[-.05,.10],llm:[-.68,.78],tools:[.68,.68],environment:[.05,-.90]},
];
export const mobile:Record<string,number[]>[] = [
 {ai:[-.50,.86],ml:[.48,.86],nn:[-.50,.28],dl:[.48,.28],symbolic:[-.50,-.32],transformer:[.48,-.32],agent:[-.50,-.92],llm:[.48,-.92]},
 {ml:[-.42,.78],dl:[.46,.78],nn:[-.46,-.66],tree:[.46,-.66]},
 {nn:[-.46,.78],dl:[.46,.78],deepnn:[0,-.92]},
 {nn:[-.46,.78],transformer:[-.32,-.02],vision:[.47,.78],llm:[.47,-.88]},
 {agent:[-.05,.04],llm:[-.47,.80],tools:[.49,.66],environment:[.02,-.92]},
];
