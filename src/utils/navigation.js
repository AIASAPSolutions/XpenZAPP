import { DrawerActions } from '@react-navigation/native';

/** Opens the root drawer from nested tab/stack screens. */
export const openAppDrawer = (navigation) => {
  const drawer = navigation.getParent('LeftDrawer');
  if (drawer?.openDrawer) {
    drawer.openDrawer();
    return;
  }
  navigation.dispatch(DrawerActions.openDrawer());
};
