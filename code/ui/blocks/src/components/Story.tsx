import { global } from '@storybook/global';
import type { FunctionComponent } from 'react';
import React, { useRef, useEffect, useState } from 'react';
import type { DocsContextProps, PreparedStory } from '@storybook/types';
import { Loader, getStoryHref } from '@storybook/components';
import { IFrame } from './IFrame';
import { ZoomContext } from './ZoomContext';

const { PREVIEW_URL } = global;
const BASE_URL = PREVIEW_URL || 'iframe.html';

interface CommonProps {
  story: PreparedStory;
  inline: boolean;
}

interface InlineStoryProps extends CommonProps {
  inline: true;
  height?: string;
  autoplay: boolean;
  renderStoryToElement: DocsContextProps['renderStoryToElement'];
}

interface IFrameStoryProps extends CommonProps {
  inline: false;
  height: string;
}

export type StoryProps = InlineStoryProps | IFrameStoryProps;

const InlineStory: FunctionComponent<InlineStoryProps> = ({
  story,
  height,
  autoplay,
  renderStoryToElement,
}) => {
  const storyRef = useRef();
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    if (!(story && storyRef.current)) {
      return () => {};
    }
    const element = storyRef.current as HTMLElement;
    const cleanup = renderStoryToElement(story, element, { autoplay });
    setShowLoader(false);
    return () => {
      cleanup();
    };
  }, [autoplay, renderStoryToElement, story]);

  // We do this so React doesn't complain when we replace the span in a secondary render
  const htmlContents = `<span></span>`;

  return (
    <>
      {height ? (
        <style>{`#story--${story.id} { min-height: ${height}; transform: translateZ(0); overflow: auto }`}</style>
      ) : null}
      {showLoader && <StorySkeleton />}
      <div
        ref={storyRef}
        data-name={story.name}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: htmlContents }}
      />
    </>
  );
};

const IFrameStory: FunctionComponent<IFrameStoryProps> = ({ story, height = '500px' }) => (
  <div style={{ width: '100%', height }}>
    <ZoomContext.Consumer>
      {({ scale }) => {
        return (
          <IFrame
            key="iframe"
            id={`iframe--${story.id}`}
            title={story.name}
            src={getStoryHref(BASE_URL, story.id, { viewMode: 'story' })}
            allowFullScreen
            scale={scale}
            style={{
              width: '100%',
              height: '100%',
              border: '0 none',
            }}
          />
        );
      }}
    </ZoomContext.Consumer>
  </div>
);

/**
 * A story element, either rendered inline or in an iframe,
 * with configurable height.
 */
const Story: FunctionComponent<StoryProps> = (props) => {
  const { inline } = props;
  return inline ? (
    <InlineStory {...(props as InlineStoryProps)} />
  ) : (
    <IFrameStory {...(props as IFrameStoryProps)} />
  );
};

const StorySkeleton = () => <Loader />;

export { Story, StorySkeleton };
