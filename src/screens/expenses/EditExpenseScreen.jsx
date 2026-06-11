import React from 'react';
import AddExpenseScreen from './AddExpenseScreen';

/** Edit flow reuses the add form with pre-filled expense data. */
export const EditExpenseScreen = ({ route, ...rest }) => {
  const prefillData = route.params?.prefillData ?? route.params?.expense;
  return (
    <AddExpenseScreen
      {...rest}
      route={{
        ...route,
        params: { ...route.params, prefillData },
      }}
    />
  );
};

export default EditExpenseScreen;
