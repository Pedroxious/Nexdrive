import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'about',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'buy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'rent',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'faq',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contact',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'legal/privacidade',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'legal/termos',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'legal/ajuda',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'legal/faq',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'legal/forum',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'car/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' },
        { id: '6' }, { id: '7' }, { id: '8' }, { id: '9' }, { id: '10' }
      ];
    }
  },
  {
    path: 'rent/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return [
        { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
      ];
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
