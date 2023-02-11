const fs = require('fs');

function main (source, destination) {
  let data = fs.readFileSync(source, 'utf8');
  data = convert(data)
  fs.writeFileSync(destination, data);
}

function convert (content) {
  const res_list = []
  let lines = content.split('\n').filter(line => /\S/.test(line))
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/\s+$/, '')

    // 分析 rank
    let white_prefix  = line.match(/^[ \t]*/)
    let space_count = (white_prefix[0].match(/ /g) || []).length;
    let tab_count = (white_prefix[0].match(/\t/g) || []).length;
    let rank = space_count / 2 + tab_count

    let last = res_list[res_list.length - 1]
    if (last) {
      if (rank > last.rank) {
        last.text = last.text + ' {'
      } 
      else if (rank < last.rank) {
        let tab_num = last.rank - 1
        while (tab_num >= rank) {
          res_list.push({
            text: '  '.repeat(tab_num) + '}',
            rank: tab_num
          })
          tab_num --
        }
      }
      else {
        // WARN
        // line = line[line.length - 1] === ';' ? line : line + ';'
      }
    }
    res_list.push({
      text: line,
      rank
    })
    console.log(line);
  }
  // 收尾
  let last = res_list[res_list.length - 1]
  let tab_num = last.rank - 1
  let rank = res_list[0].rank
  while (tab_num >= rank) {
    res_list.push({
      text: '  '.repeat(tab_num) + '}',
      rank: tab_num
    })
    tab_num --
  }
  return res_list.map(line => line.text).join('\n')
}

main('./test/input.styl', './test/output.less');
