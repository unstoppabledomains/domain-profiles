export type ShareSocialMedia = 'twitter' | 'facebook' | 'facebook-messenger';

const formSocialMediaLink = ({
  type,
  text,
  url,
}: {
  type: ShareSocialMedia;
  text?: string;
  url?: string;
}) => {
  switch (type) {
    case 'facebook': {
      if (!text || !url) {
        throw new Error('Missing required input for formSocialMediaLink');
      }

      return `https://www.facebook.com/sharer/sharer.php?display=popup&u=${encodeURIComponent(
        url,
      )}&quote=${encodeURIComponent(text)}`;
    }
    case 'facebook-messenger': {
      if (!url) {
        throw new Error('Missing required input for formSocialMediaLink');
      }

      return `https://www.facebook.com/dialog/send?app_id=1790432161129014&link=${encodeURIComponent(
        url,
      )}&redirect_uri=${encodeURIComponent(url)}`;
    }
    case 'twitter': {
      if (!text) {
        throw new Error('Missing required input for formSocialMediaLink');
      }

      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text,
      )}`;
    }
    default: {
      throw new Error('Type not recognized');
    }
  }
};

export default formSocialMediaLink;
