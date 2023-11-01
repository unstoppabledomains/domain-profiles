import React from 'react';

export const Swiper = ({children}: {children: any}) => (
  <div data-testid="swiper-testid">{children}</div>
);

export const SwiperSlide = ({children}: {children: any}) => (
  <div data-testid="swiper-slide-testid">{children}</div>
);
