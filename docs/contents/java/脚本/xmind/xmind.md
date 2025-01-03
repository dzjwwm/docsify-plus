# 生成xmind
## 1.1 下载
<a href="/files/xmindjbehaveplugin-0.8.jar" download>下载 xmindjbehaveplugin-0.8.jar</a>


## 1.2 maven安装命令
> 前提：maven环境已经安装，将下载的xmindjbehaveplugin-0.8.jar放在项目根目录
```shell
mvn install:install-file -Dfile=xmindjbehaveplugin-0.8.jar -DgroupId=com.github.eljah -DartifactId=xmindjbehaveplugin -Dversion=0.8 -Dpackaging=jar
```
> [!warning]
> -Dfile=xmindjbehaveplugin-0.8.jar：需要替换成自己的路径

![目录结构](assets/1.png)

## 1.3 添加pom.xml

```xml
<dependencies>
    <!--xmind-->
    <dependency>
        <groupId>com.github.eljah</groupId>
        <artifactId>xmindjbehaveplugin</artifactId>
        <version>0.8</version>
    </dependency>
    <!--lombok-->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <scope>provided</scope>
        <version>1.18.24</version>
    </dependency>
    <!--fastjson-->
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>fastjson</artifactId>
        <version>1.2.78</version>
    </dependency>
</dependencies>
```

## 1.4 生成xmind代码(Make.java)
```java
package org.generate.xmind;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.xmind.core.*;

import java.io.IOException;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Make {
    String fileName;
    static IWorkbook workbook;
    static ITopic rootTopic;


    static {
        // 创建工作空间
        IWorkbookBuilder workbookBuilder = Core.getWorkbookBuilder();
        workbook = workbookBuilder.createWorkbook();

        // 创建一个新的思维导图
        ISheet primarySheet = workbook.getPrimarySheet();
        rootTopic = primarySheet.getRootTopic();
    }

    public void setRootTopicTitle(String text) {
        rootTopic.setTitleText(text);
    }

    public ITopic getRootTopic() {
        return rootTopic;
    }

    /**
     * 生成主题
     *
     * @param parentTopic 父级主题
     * @param text        生成主题的文本
     * @return 当前生成的主题
     */
    public ITopic addTopic(ITopic parentTopic, String text) {
        ITopic topic = workbook.createTopic();
        topic.setTitleText(text);
        parentTopic.add(topic, ITopic.ATTACHED);
        return topic;
    }

    /**
     * 添加优先级
     *
     * @param topic    当前主题
     * @param priority 级别
     */
    public void addPriority(ITopic topic, int priority) {
        if (priority >= 1 && priority <= 4) {
            topic.addMarker("priority-" + priority);
            return;
        }
        throw new RuntimeException("优先级仅支持1、2、3、4");
    }

    /**
     * 添加备注
     *
     * @param topic 当前主题
     * @param text  备注内容
     */
    public void addNote(ITopic topic, String text) {
        IPlainNotesContent plainContent = (IPlainNotesContent) workbook.createNotesContent(INotes.PLAIN);
        plainContent.setTextContent(text);
        INotes notes = topic.getNotes();
        notes.setContent(INotes.PLAIN, plainContent);
    }

    /**
     * 保存
     *
     * @throws CoreException
     * @throws IOException
     */
    public void saveFile() throws CoreException, IOException {
        workbook.save(fileName);
    }
}
```
## 1.5 JSON数据格式
```json
{
  "模块1": {
    "模块1-1": [
      {
        "title": "标题：模块1-1",
        "priority": 1,
        "note": "\n前置条件：\n\n用例步骤：\n\n\n预期结果：\n"
      }
    ],
    "模块1-2": [
      {
        "title": "标题：模块1-2",
        "priority": 1,
        "note": "\n前置条件：\n\n用例步骤：\n\n\n预期结果：\n"
      }
    ],
    "模块1-3": {
      "模块1-3-1": [
        {
          "title": "标题：模块1-3-1",
          "priority": 1,
          "note": "\n前置条件：\n\n用例步骤：\n\n\n预期结果：\n"
        }
      ]
    }
  },
  "模块2": {
    "模块2-1": {
      "模块2-1-1": [
        {
          "title": "标题：模块2-1-1",
          "priority": 1,
          "note": "\n前置条件：\n\n用例步骤：\n\n\n预期结果：\n"
        }
      ]
    }
  }
}
```
## 1.6 调用（App.java）
```java
package org.generate.xmind;

import com.alibaba.fastjson.JSON;
import org.xmind.core.*;
import com.alibaba.fastjson.JSONObject;
import com.alibaba.fastjson.JSONArray;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;


/**
 * Hello world!
 */

public class App {

    static Make make;

    static {
        make = new Make();
    }

    /**
     * 读取json文件
     *
     * @param path 文件路径：data/测试.json
     * @return
     * @throws Exception
     */
    public static JSONObject getJSon(String path) throws Exception {
        InputStream inputStream = App.class.getClassLoader().getResourceAsStream(path);
        if (inputStream == null) {
            throw new FileNotFoundException("文件未找到");
        }
        BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8));
        StringBuilder content = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            content.append(line);
        }
        return JSONObject.parseObject(content.toString());
    }

    /**
     * 替换字符串
     * @param data 字符串
     * @param nameList 需要替换的规则
     * @return 替换后的数据
     */
    public static String parameterCase(String data, JSONObject nameList) {
        for (String keyName : nameList.keySet()) {
            data = data.replace(keyName, nameList.getString(keyName));
        }
        return data;
    }

    /**
     * 递归生成case
     *
     * @param data        json数据
     * @param parentTopic 主题对象
     * @param nameList    需要替换的名称，
     */
    public static void loopJson(JSONObject data, ITopic parentTopic, JSONObject nameList) {
        // 循环获取json的key
        for (String key : data.keySet()) {
            if (data.get(key) instanceof JSONObject) {
                // 判断key对应value是否为json对象，设置主题，并继续调用loopJson处理
                JSONObject value = (JSONObject) data.get(key);

                ITopic topic = make.addTopic(parentTopic, parameterCase(key, nameList));
                loopJson(value, topic, nameList);
            } else if (data.get(key) instanceof JSONArray) {
                // 判断key对应value是否为数组，设置主题
                ITopic lastTopic = make.addTopic(parentTopic, parameterCase(key, nameList));
                JSONArray jsonArray = (JSONArray) data.get(key);
                for (Object caseData : jsonArray) {
                    // 循环数组里的用例
                    JSONObject jsonCase = (JSONObject) caseData;
                    ITopic topic = make.addTopic(lastTopic, parameterCase(JSON.toJSONString(jsonCase.get("title")), nameList));
                    make.addPriority(topic, Integer.parseInt(JSON.toJSONString(jsonCase.get("priority"))));
                    String note = (String) jsonCase.get("note");
                    make.addNote(topic, parameterCase(note, nameList));
                }
            }
        }
    }

    public static void main(String[] args) throws Exception {
        String[] paths = {"data/测试.json"};
        String fileName = "测试";
        // 设置文件名
        make.setFileName(fileName + ".xmind");
        make.setRootTopicTitle(fileName);
        // 声明需要替换的参数
        JSONObject nameList = new JSONObject();
        nameList.put("${name}", "测试");
        for (String path : paths) {
            JSONObject data = getJSon(path);
            loopJson(data, make.getRootTopic(), nameList);
        }
        make.saveFile();

    }
}

```
