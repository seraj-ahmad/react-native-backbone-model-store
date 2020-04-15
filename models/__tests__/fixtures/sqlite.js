const fixture = {
  "sample_portfolio": {
    "_id" : "4fa87b0e9da1eb040403001a",
    "name":"wellstrade",
    "account": {
      "email": "mirza.ghalib@gmail.com",
      "account_no": "123456789",
      "description":"wells fargo brokerage account",
    },
    "positions":{
      "NOK": { 
        "symbol":"NOK",
        "company": {
          "full_name": "Nokia Corp",
          "industry": "technology"
        },
        "lots": { 
          "4fa87b0e9da1eb040403001b": { 
            "_id" : "4fa87b0e9da1eb040403001b",
            "acq_date" : "2012-05-14T00:00:00",
            "quantity":2000,
            "total_cost":6498.20
          },
          "5fa87b0e9da1eb040403001c": {
            "_id":"5fa87b0e9da1eb040403001c",
            "acq_date":"2012-05-22T00:00:00",
            "quantity":5000,
            "total_cost":9498.20
          },
          "6fa87b0e9da1eb040403001d":{
            "_id":"6fa87b0e9da1eb040403001d",
            "acq_date":"2012-06-14T00:00:00",
            "quantity":7000,
            "total_cost":18498.20
          }
        },
        "_id":"NOK"
      }, 
      "MENT": {
        "symbol":"MENT",
        "company": {
          "full_name": "Mentor Graphics",
          "industry": "technology"
        },
        "lots":{},
        "_id":"MENT"
      }
    }
  },
  TABLE_FIELDS: {
    ns: 'cms/Blog',
    name: 'cms_Blog',
    fields: [{ name: '"_id"', spec: 'VARCHAR(24) PRIMARY KEY' }, { name: '"_n"', spec: 'INTEGER DEFAULT -1' }, { name: '"_v"', spec: 'INTEGER' }, { name: '"title"', spec: 'VARCHAR(256)' }, { name: '"author"', spec: 'VARCHAR(256)' }, { name: '"state"', spec: 'VARCHAR(256)' }, { name: '"category"', spec: 'VARCHAR(256)' }, { name: '"tags"', spec: 'TEXT' }, { name: '"excerpt"', spec: 'TEXT' }, { name: '"content"', spec: 'TEXT' }, { name: '"excerpt_html"', spec: 'TEXT' }, { name: '"content_html"', spec: 'VARCHAR(256)' }, { name: '"date_created"', spec: 'VARCHAR(64)' }, { name: '"date_posted"', spec: 'VARCHAR(64)' }, { name: '"expiry_date"', spec: 'VARCHAR(64)' }]
  },
  TABLE_FIELDNAMES: {
    ns: 'cms/Blog',
    fieldNames: [ '_id', '_n', '_v', 'author', 'category', 'content', 'content_html', 'date_created', 'date_posted', 'excerpt', 'excerpt_html', 'expiry_date', 'state', 'tags', 'title' ]
  },
  prepareData: {
    ns: 'cms/Blog',
    data: {
      "_id": "6fa87b0e9da1eb0404030022",
      "_h" :"6fa87b0e9da1eb0404030121",
      "_v" : 1,
      "revoked": true,
      "category": "blog",
      "excerpt_html": null,
      "author": "52e7edd1e220b442e676538e",
      "tags": [],
      "excerpt": "cool gadgets for 2015",
      "date_posted": null,
      "content": "..some text",
      "state": "draft",
      "expiry_date": null,
      "date_created": "2014-04-15T10:10:19.458000",
      "title": "Cool Gadgets",
      "content_html": ''
    },
    expected: {
      cleaned: {
        '"_id"': '"6fa87b0e9da1eb0404030022"',
        '"_v"': '1',
        '"category"': '"blog"',
        '"excerpt_html"': 'null',
        '"author"': '"52e7edd1e220b442e676538e"',
        '"tags"': '[]',
        '"excerpt"': '"cool gadgets for 2015"',
        '"date_posted"': 'null',
        '"content"': '"..some text"',
        '"state"': '"draft"',
        '"expiry_date"': 'null',
        '"date_created"': '"2014-04-15T10:10:19.458000"',
        '"title"': '"Cool Gadgets"',
        '"content_html"': '""',
      }
    }
  },
  recreate: {
    table: 'cms_Blog',
    expected: {
      txns: [['DROP TABLE IF EXISTS cms_Blog',
       'CREATE TABLE IF NOT EXISTS cms_Blog("_s" INTEGER DEFAULT 1,"_id" VARCHAR(24) PRIMARY KEY,"_n" INTEGER DEFAULT -1,"_v" INTEGER,"title" VARCHAR(256),"author" VARCHAR(256),"state" VARCHAR(256),"category" VARCHAR(256),"tags" TEXT,"excerpt" TEXT,"content" TEXT,"excerpt_html" TEXT,"content_html" VARCHAR(256),"date_created" VARCHAR(64),"date_posted" VARCHAR(64),"expiry_date" VARCHAR(64))']]
    }
  },
  create: {
    table: 'cms_Blog',
    fields: [{ name: '"_id"', spec: 'VARCHAR(24) PRIMARY KEY' }, { name: '"_n"', spec: 'INTEGER DEFAULT -1' }, { name: '"_v"', spec: 'INTEGER' }, { name: '"title"', spec: 'VARCHAR(256)' }, { name: '"author"', spec: 'VARCHAR(256)' }, { name: '"state"', spec: 'VARCHAR(256)' }, { name: '"category"', spec: 'VARCHAR(256)' }, { name: '"tags"', spec: 'TEXT' }, { name: '"excerpt"', spec: 'TEXT' }, { name: '"content"', spec: 'TEXT' }, { name: '"excerpt_html"', spec: 'TEXT' }, { name: '"content_html"', spec: 'VARCHAR(256)' }, { name: '"date_created"', spec: 'VARCHAR(64)' }, { name: '"date_posted"', spec: 'VARCHAR(64)' }, { name: '"expiry_date"', spec: 'VARCHAR(64)' }],
    expected: {
      txns: [['CREATE TABLE IF NOT EXISTS cms_Blog("_s" INTEGER DEFAULT 1,"_id" VARCHAR(24) PRIMARY KEY,"_n" INTEGER DEFAULT -1,"_v" INTEGER,"title" VARCHAR(256),"author" VARCHAR(256),"state" VARCHAR(256),"category" VARCHAR(256),"tags" TEXT,"excerpt" TEXT,"content" TEXT,"excerpt_html" TEXT,"content_html" VARCHAR(256),"date_created" VARCHAR(64),"date_posted" VARCHAR(64),"expiry_date" VARCHAR(64))']]
    }
  },
  drop: {
    expected: {
      txns: [['DROP TABLE IF EXISTS cms_Blog']]
    }
  },
  crud: {
    insert: {
      data: {
        "_id": "__tmp1",
        "_v" : 0,
        "category": "general",
        "excerpt_html": null,
        "author": "52e7edd1e220b442e676538e",
        "tags": [],
        "excerpt": "new excerpt next line",
        "date_posted": null,
        "content": "<p>newer ererContent. Bacaonaipsum dolor sit amet esse duis a anim, pancetta fatback capicola officia tenderloin. Meatloaf culpa ut, bacon sed sausage jerky cillum est ham ad laboris ham hock dolore. Venison ut enim, aliqua elit frankfurter et incididunt consequat culpa nostru aliqua elit parineeta america.</p>\n",
        "state": "draft",
        "expiry_date": null,
        "date_created": "2014-04-15T10:10:19.458000",
        "title": "New Title",
        "content_html": null
      },
      expected: {
        txns: [{ stmt: 'INSERT OR REPLACE INTO cms_Blog ("_id","_v","author","category","content","content_html","date_created","date_posted","excerpt","excerpt_html","expiry_date","state","tags","title") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', values: [ '"__tmp1"', '0', '"52e7edd1e220b442e676538e"', '"general"', '"<p>newer ererContent. Bacaonaipsum dolor sit amet esse duis a anim, pancetta fatback capicola officia tenderloin. Meatloaf culpa ut, bacon sed sausage jerky cillum est ham ad laboris ham hock dolore. Venison ut enim, aliqua elit frankfurter et incididunt consequat culpa nostru aliqua elit parineeta america.</p>\\n"', 'null', '"2014-04-15T10:10:19.458000"', 'null', '"new excerpt next line"', 'null', 'null', '"draft"', '[]', '"New Title"' ] }]
      }
    },
    multiInsert: {
      data: [{
        "_id": "__tmp1",
        "_v" : 0,
        "category": "blog",
        "excerpt_html": null,
        "author": "52e7edd1e220b442e676538e",
        "tags": [],
        "excerpt": "cool gadgets for 2015",
        "date_posted": null,
        "content": "..some text",
        "state": "draft",
        "expiry_date": null,
        "date_created": "2014-04-15T10:10:19.458000",
        "title": "Cool Gadgets",
        "content_html": ''
      }, {
        "_id": "__tmp2",
        "_v" : 1,
        "category": "article",
        "excerpt_html": null,
        "author": "52e7edd1e220b442e676538e",
        "tags": [],
        "excerpt": "increase your productivity",
        "date_posted": null,
        "content": "...other text",
        "state": "draft",
        "expiry_date": null,
        "date_created": "2014-04-15T10:10:19.458000",
        "title": "Improving Productivity",
        "content_html": ''
      }],
      expected: {
        txns: [[ 
          { stmt: 'INSERT OR REPLACE INTO cms_Blog ("_id","_v","author","category","content","content_html","date_created","date_posted","excerpt","excerpt_html","expiry_date","state","tags","title") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', values: [ '"__tmp1"', '0', '"52e7edd1e220b442e676538e"', '"blog"', '"..some text"', '""', '"2014-04-15T10:10:19.458000"', 'null', '"cool gadgets for 2015"', 'null', 'null', '"draft"', '[]', '"Cool Gadgets"' ] },
          { stmt: 'INSERT OR REPLACE INTO cms_Blog ("_id","_v","author","category","content","content_html","date_created","date_posted","excerpt","excerpt_html","expiry_date","state","tags","title") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', values: [ '"__tmp2"', '1', '"52e7edd1e220b442e676538e"', '"article"', '"...other text"', '""', '"2014-04-15T10:10:19.458000"', 'null', '"increase your productivity"', 'null', 'null', '"draft"', '[]', '"Improving Productivity"' ] },
        ]]
      }
    },
    delete: {
      query: { '_id': '534d67fbe220b46e64acb784' },
      expected: {
        txns: [
          { stmt: 'DELETE FROM cms_Blog WHERE "_id" = ?', values: ['"534d67fbe220b46e64acb784"'] },
        ]
      }
    },
    update: {
      criteria: {"_id": "534d67fbe220b46e64acb784" },
      delta : { "_v": 6, "category": "marketing", "title": "Top Productivity Tools"},
      expected: {
        txns: [
          { stmt: 'UPDATE OR REPLACE cms_Blog SET "_v" = ?, "category" = ?, "title" = ? WHERE "_id" = ?', values: [ '6', '"marketing"', '"Top Productivity Tools"', '"534d67fbe220b46e64acb784"' ] }
        ]
      }
    }
  },
  sqlQuery: {
    plain: {
      query: {},
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog', values: [] }],
      }
    },
    criteria: {
      query: { 'category': 'blogs', 'state': 'published' },
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog WHERE "category" = ? AND "state" = ?', values: [ '"blogs"', '"published"' ] }]
      }
    },
    projection: {
      query: {},
      fields: ['title', 'category', 'excerpt', 'content_html'],
      expected: {
        txns: [{ stmt: 'SELECT "title","category","excerpt","content_html" FROM cms_Blog', values: [  ] }],
      }
    },
    defaultLimit: {
      query: {},
      options: {
        paging: {page: 1},
      },
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog LIMIT 10', values: []}],
      }
    },
    limit: {
      query: {},
      options: {
        paging: {page: 1, page_size: 20},
      },
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog LIMIT 20', values: []}],
      }
    },
    skipLimit: {
      query: {},
      options: {
        paging: {page: 2, page_size: 25},
      },
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog LIMIT 25 OFFSET 25', values: [] }]
      }
    },
    ordered: {
      query: {},
      options: {
        paging: {page: 2, page_size: 25, },
        ordering: [["date_created", -1], ["title", 1]]
      },
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog ORDER BY date_created DESC, title LIMIT 25 OFFSET 25', values: [] }],
      }
    },
    allClauses: {
      query: { 'category': 'blogs', 'state': 'published' },
      fields: ['title', 'category', 'excerpt', 'content_html'],
      options: {
        paging: {page: 2, page_size: 25 },
        ordering: [["date_created", -1], ["title", 1]]
      },
      expected: {
        txns: [{ stmt: 'SELECT "title","category","excerpt","content_html" FROM cms_Blog WHERE "category" = ? AND "state" = ? ORDER BY date_created DESC, title LIMIT 25 OFFSET 25', values: [ '"blogs"', '"published"' ]}],
      }
    },
    resultsProcessing: {
      query: {},
      mockResult: {
        pattern: /SELECT/, 
        data: [
          {
            "_id": '"534d67fbe220b46e64acb784"',
            "_v": '1',
            "category": '"general"',
            "excerpt_html": 'null',
            "author": '"52e7edd1e220b442e676538e"',
            "tags": '[]',
            "excerpt": '"content is king"',
            "date_posted": 'null',
            "content": '"<p>newer and better content</p>\\n"',
            "state": '"draft"',
            "expiry_date": 'null',
            "date_created": '"2014-04-15T10:10:19.458000"',
            "title": '"Content Strategy"',
            "content_html": 'null'
          }
          ,
          {
            "_id": '"534d67fbe220b46e64acb984"',
            "_v": '2',
            "category": '"general"',
            "excerpt_html": 'null',
            "author": '"52e7edd1e220b442e676538e"',
            "tags": '[]',
            "excerpt": '"productivity improvement"',
            "date_posted": 'null',
            "content": '"<p>email software like clozr</p>\\n"',
            "state": '"draft"',
            "expiry_date": 'null',
            "date_created": '"2014-04-15T10:10:19.458000"',
            "title": '"Improve Productivity"',
            "content_html": 'null'
          }
        ]
      },
      expected: {
        txns: [{ stmt: 'SELECT * FROM cms_Blog', values: []}],
        rows: [ { "_id": '534d67fbe220b46e64acb784', "_v": 1, "category": 'general', "excerpt_html": null, "author": '52e7edd1e220b442e676538e', "tags": [  ], "excerpt": 'content is king', "date_posted": null, "content": '<p>newer and better content</p>\n', "state": 'draft', "expiry_date": null, "date_created": '2014-04-15T10:10:19.458000', "title": 'Content Strategy', "content_html": null }, { "_id": '534d67fbe220b46e64acb984', "_v": 2, "category": 'general', "excerpt_html": null, "author": '52e7edd1e220b442e676538e', "tags": [  ], "excerpt": 'productivity improvement', "date_posted": null, "content": '<p>email software like clozr</p>\n', "state": 'draft', "expiry_date": null, "date_created": '2014-04-15T10:10:19.458000', "title": 'Improve Productivity', "content_html": null } ]
      }
    }
  },
  SQL_QUERY_MIXED: {
    criteria: { 'category': 'blogs', 'state': 'published' },
    fields: ['title', 'category', 'excerpt', 'content_html'],
  }
};

module.exports = fixture;
export default fixture;
