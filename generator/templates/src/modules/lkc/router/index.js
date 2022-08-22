
      const lkcRoutes = [
        {
          path: '/lkc',
          component: () => import(/* webpackChunkName: "lkc" */ '@/modules/lkc/pages/Home.vue'),
          children: [
            {
              path: '',
              name: 'Lkc',
              component: () => import(/* webpackChunkName: "lkc" */ '@/modules/lkc/pages/Lkc.vue'),
            },
          ],
        }
      ];

      export default lkcRoutes;
    