const Mock = require('mockjs');

const Random = Mock.Random;

module.exports = {
  getNotifiList: Mock.mock({
    "total":132,
    'contents|10': [{
      'id|+1': '@id',
      'title':'@ctitle()',
      'content':'@cparagraph()',
      'start_date':'@datetime()',
      'end_date':'@datetime()',
      'notice_status|1':['PUBLICSHING','EDITING']
    }]
  }),
};
