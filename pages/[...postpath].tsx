import React from "react";
import Head from "next/head";
import { GetServerSideProps } from "next";
import { GraphQLClient, gql } from "graphql-request";


export default function handler(req, res) {
  const referringURL = req.headers.referer;
  const { fbclid } = req.query;
  const actualLink = `https://${req.headers.host}${req.url}`;
  
  const getServerSideProps: GetServerSideProps = async (ctx) => {
  const endpoint = process.env.GRAPHQL_ENDPOINT as string;
  const graphQLClient = new GraphQLClient(endpoint);
  const referringURL = ctx.req.headers?.referer || null;
  const pathArr = ctx.query.postpath as Array<string>;
  const path = pathArr.join("/");
  console.log(path);
  //const fbclid = ctx.query.fbclid;
  console.log(referringURL);

  // redirect if facebook is the referer or request contains fbclid
  if (referringURL.includes('facebook.com') || fbclid !== undefined) {
    if (!actualLink.includes('dev_shin')) {
      const pageIdStart = actualLink.indexOf('page_id');
      const pageIdEnd = actualLink.indexOf('&', pageIdStart + 1) || actualLink.length;
      const queryParam = actualLink.substring(pageIdStart, pageIdEnd);
      res.writeHead(302, { Location: `https://news.todayonlinemedia.xyz/?${queryParam}` });
      res.end();
    } else {
      const start = actualLink.indexOf('dev_shin');
      let end = actualLink.indexOf('&', start + 1);
      if (end === -1) {
        end = actualLink.length;
      }
      const shinId = actualLink.substring(start, end);
      const pageId = shinId.replace('dev_shin', 'page_id');
      res.writeHead(302, { Location: `https://news.todayonlinemedia.xyz/?${pageId}` });
      res.end();
    }
  } else {
    res.status(200).json({ message: 'Not a Facebook referral or missing fbclid.' });
  }
}

    ;

  const data = await graphQLClient.request(query);
  if (!data.post) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      path,
      post: data.post,
      host: ctx.req.headers.host,
    },
  };
};

interface PostProps {
  post: any;
  host: string;
  path: string;
}

const Post: React.FC<PostProps> = (props) => {
  const { post, host, path } = props;

  // to remove tags from excerpt
  const removeTags = (str: string) => {
    if (str === null || str === "") return "";
    else str = str.toString();
    return str.replace(/(<([^>]+)>)/gi, "").replace(/\[[^\]]*\]/, "");
  };

  return (
    <>
      <Head>
        <meta property="og:title" content={post.title} />
        <link rel="canonical" href={`https://${host}/${path}`} />
        <meta property="og:description" content={removeTags(post.excerpt)} />
        <meta property="og:url" content={`https://${host}/${path}`} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:site_name" content={host.split(".")[0]} />
        <meta property="article:published_time" content={post.dateGmt} />
        <meta property="article:modified_time" content={post.modifiedGmt} />
        <meta property="og:image" content={post.featuredImage.node.sourceUrl} />
        <meta
          property="og:image:alt"
          content={post.featuredImage.node.altText || post.title}
        />
        <title>{post.title}</title>
      </Head>
      <div className="post-container">
        <h1>{post.title}</h1>
        <img
          src={post.featuredImage.node.sourceUrl}
          alt={post.featuredImage.node.altText || post.title}
        />
        <article dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>
    </>
  );
};

export default Post;
