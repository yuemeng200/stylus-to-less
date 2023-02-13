const fs = require('fs');

function main (source, destination) {
  let data = fs.readFileSync(source, 'utf8');
  let ast  = constructAST(data)
  let res = transform(ast)
  fs.writeFileSync(destination, res);
}

class Node {
  constructor (text, parent, rank, children) {
    this.text = text || ''
    this.parent = parent || null
    this.children = children || []
  }
}

function constructAST (content) {
  let lines = content.split('\n').filter(line => /\S/.test(line))
  let ast = new Node()
  let pointNode = ast
  let lastRank = -1
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\s+$/, '')
    // 分析 rank
    let whitePrefix  = line.match(/^[ \t]*/)
    let spaceCount = (whitePrefix[0].match(/ /g) || []).length;
    let tabCount = (whitePrefix[0].match(/\t/g) || []).length;
    let rank = spaceCount / 2 + tabCount

    let node = new Node(line)
    if (rank > lastRank || lastRank == -1) {
      node.parent = pointNode
      pointNode.children.push(node)
      pointNode = node
    }
    else {
      let pos = lastRank
      while (pos -- >= rank) {
        pointNode = pointNode.parent
      } 
      node.parent = pointNode
      pointNode.children.push(node)
    }
    pointNode = node
    lastRank = rank
  }
  return ast
}

function transform(ast) {
  let res = ''
  preOrderTraversal(ast)
  return res

  function preOrderTraversal(node) {
    if (node !== null) {
      let isSelector = node.text && node.children.length
      if (node.text) {
        let text = node.text
        if (isSelector) {
          text = node.text + ' {'
        }
        else {
          // 末尾分号
          if (!text.endsWith(';')) {
            text += ';'
          }
        }
        res += (text + '\n')
      }
      for (let child of node.children) {
        preOrderTraversal(child);
      }
      if (isSelector) {
        res += node.text.match(/^[ \t]*/) + '}\n'
      }
    }
  }
}

main('./test/input.styl', './test/output.less');
