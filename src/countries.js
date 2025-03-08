// src/countries.js
const countries = [
  {
    code: "MM",
    name: "Myanmar",
    provinces: [
      {
        name: "Yangon Region",
        cities: ["Yangon", "Insein", "Hlegu"]
      },
      {
        name: "Mandalay Region",
        cities: ["Mandalay", "Pyin Oo Lwin", "Amarapura"]
      }
    ]
  },
  {
    code: "TH",
    name: "Thailand",
    provinces: [
      {
        name: "Bangkok",
        cities: [
          "Bangkok",
          "Nonthaburi",
          "Pathum Thani",
          "Bang Sue",
          "Chatuchak",
          "Phra Nakhon",
          "Sathon",
          "Bang Rak",
          "Dusit",
          "Thon Buri"
        ]
      },
      {
        name: "Chiang Mai Province",
        cities: ["Chiang Mai", "Lampang", "Lamphun"]
      },
      {
        name: "Phuket Province",
        cities: ["Phuket", "Patong", "Kathu", "Surin"]
      },
      {
        name: "Chonburi Province",
        cities: ["Pattaya", "Laem Chabang", "Sattahip"]
      },
      {
        name: "Nakhon Ratchasima Province",
        cities: ["Nakhon Ratchasima", "Korat", "Bua Yai"]
      }
    ]
  }
];

export default countries;
