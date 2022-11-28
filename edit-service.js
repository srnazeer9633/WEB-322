const Sequelize = require("sequelize");
var sequelize = new Sequelize(
  "czleiwbi",
  "czleiwbi",
  "8ROJIM_D1zu_fOiAARoI8lIaBZK4QtBm",
  {
    host: "peanut.db.elephantsql.com",
    dialect: "postgres",
    port: 5432,
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    query: { raw: true },
  }
);

var Article = sequelize.define("Article", {
  Content: Sequelize.TEXT,
  Title: Sequelize.STRING,
  Date: Sequelize.DATE,
  Image: Sequelize.STRING,
  published: Sequelize.BOOLEAN,
});

exports.initialize = () => {
  return new Promise((resolve, reject) => {
    sequelize
      .sync()
      .then(() => {
        resolve("DB SYNCED");
      })
      .catch(() => {
        reject("DB SYNC FAILED ! :(");
      });
  });
};

exports.getAllArticles = () => {
  return new Promise((resolve, reject) => {
    Article.findAll()
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

exports.getPublishedArticles = () => {
  return new Promise((resolve, reject) => {
    Article.findAll({
      where: { published: true },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

exports.getArticlesById = (id_) => {
  return new Promise((resolve, reject) => {
    Article.findOne({
      where: { id: id_ },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("no results returned");
      });
  });
};

exports.addArticle = (ArticleData) => {
  return new Promise((resolve, reject) => {
    console.log("i am here at add article");
    ArticleData.published = ArticleData.published ? true : false;
    for (let item in ArticleData) {
      if (ArticleData[item] == "") {
        ArticleData[item] = null;
      }
    }
    ArticleData.ArticleDate = new Date();
    Article.create(ArticleData)
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No record Found");
      });
  });
};

exports.getArticlesByMinDate = (minDateStr) => {
  return new Promise((resolve, reject) => {
    const { gte } = Sequelize.Op;
    Article.findAll({
      where: {
        articleDate: {
          [gte]: new Date(minDateStr),
        },
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch(() => {
        reject("No record Found");
      });
  });
};

exports.deleteArticleById = (id_) => {
  return new Promise((resolve, reject) => {
    Article.destroy({
      where: {
        id: id_,
      },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("Unable to delete post");
      });
  });
};

//edit article

exports.updateArticleById = (id_, ArticleData) => {
  return new Promise((resolve, reject) => {
    ArticleData.published = ArticleData.published ? true : false;
    for (let item in ArticleData) {
      if (ArticleData[item] == "") {
        ArticleData[item] = null;
      }
    }
    Article.update(ArticleData, {
      where: {
        id: id_,
      },
    })
      .then(() => {
        resolve();
      })
      .catch(() => {
        reject("Unable to update post");
      });
  });
};
