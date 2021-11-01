export const GET_DOCS = `
  {
    documentations {
      id
      title
      Slug
      content
    }
  }
`;

export const GET_BLOGS = `
  {
    blogs {
      id
      title
      Slug
      content
      images {
        url
        previewUrl
      }
    }
  }
`;

export const GET_WEBSITES =
  '{"query":"{\\n    digitalAssets {\\n      websites {\\n        url\\n      }\\n    }\\n  }"}';
