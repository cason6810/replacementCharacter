## 基于UEditor1.4.3 的嵌入式模板示例
[Demo](https://cason6810.github.io/replacementCharacter/replace_final.html)
### 应用场景限制
1. 设置模板，用 {{ }} 包住的为可修改部分
2. 使用者只可在设定好的位置进行编辑
3. 调用分两种情况：
> 未修改过，模板只有 {{ }} 标签
>
> 已修改过模板中无  {{ }} 标签，但已有 <script> 标签用来生成富文本实例
