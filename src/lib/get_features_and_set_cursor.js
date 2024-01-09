import featuresAt from './features_at';
import * as Constants from '../constants';
import { isDisabledDragVertexUi } from './extend/utils';

export default function getFeatureAtAndSetCursors(event, ctx) {
  const features = featuresAt.click(event, null, ctx);
  const classes = { mouse: Constants.cursors.NONE };

  if (features[0]) {

    classes.mouse = (features[0].properties.active === Constants.activeStates.ACTIVE) ?
      Constants.cursors.MOVE : Constants.cursors.POINTER;
    classes.feature = features[0].properties.meta;
    // extend start
    isDisabledDragVertexUi(ctx, features[0], classes);
    // extend end
  }

  if (ctx.events.currentModeName().indexOf('draw') !== -1) {
    classes.mouse = Constants.cursors.ADD;
  }

  ctx.ui.queueMapClasses(classes);
  ctx.ui.updateMapClasses();

  return features[0];
}
