package abi47_0_0.expo.modules.notifications;

import android.content.Context;

import abi47_0_0.expo.modules.core.BasePackage;
import abi47_0_0.expo.modules.core.ExportedModule;
import abi47_0_0.expo.modules.core.interfaces.InternalModule;
import expo.modules.core.interfaces.SingletonModule;

import java.util.Arrays;
import java.util.List;

import abi47_0_0.expo.modules.notifications.badge.BadgeModule;
import abi47_0_0.expo.modules.notifications.serverregistration.ServerRegistrationModule;
import expo.modules.notifications.notifications.NotificationManager;
import abi47_0_0.expo.modules.notifications.notifications.background.ExpoBackgroundNotificationTasksModule;
import abi47_0_0.expo.modules.notifications.notifications.categories.ExpoNotificationCategoriesModule;
import abi47_0_0.expo.modules.notifications.notifications.categories.serializers.ExpoNotificationsCategoriesSerializer;
import abi47_0_0.expo.modules.notifications.notifications.channels.AndroidXNotificationsChannelsProvider;
import abi47_0_0.expo.modules.notifications.notifications.channels.NotificationChannelGroupManagerModule;
import abi47_0_0.expo.modules.notifications.notifications.channels.NotificationChannelManagerModule;
import abi47_0_0.expo.modules.notifications.notifications.emitting.NotificationsEmitter;
import abi47_0_0.expo.modules.notifications.notifications.handling.NotificationsHandler;
import abi47_0_0.expo.modules.notifications.notifications.presentation.ExpoNotificationPresentationModule;
import abi47_0_0.expo.modules.notifications.notifications.scheduling.NotificationScheduler;
import abi47_0_0.expo.modules.notifications.permissions.NotificationPermissionsModule;
import expo.modules.notifications.tokens.PushTokenManager;
import abi47_0_0.expo.modules.notifications.tokens.PushTokenModule;

public class NotificationsPackage extends BasePackage {
  @Override
  public List<ExportedModule> createExportedModules(Context context) {
    return Arrays.asList(
      new BadgeModule(context),
      new PushTokenModule(context),
      new NotificationsEmitter(context),
      new NotificationsHandler(context),
      new NotificationScheduler(context),
      new ServerRegistrationModule(context),
      new NotificationPermissionsModule(context),
      new NotificationChannelManagerModule(context),
      new ExpoNotificationPresentationModule(context),
      new NotificationChannelGroupManagerModule(context),
      new ExpoNotificationCategoriesModule(context),
      new ExpoBackgroundNotificationTasksModule(context)
    );
  }

  @Override
  public List<SingletonModule> createSingletonModules(Context context) {
    return Arrays.asList(
      new PushTokenManager(),
      new NotificationManager()
    );
  }

  @Override
  public List<InternalModule> createInternalModules(Context context) {
    return Arrays.asList(
      new AndroidXNotificationsChannelsProvider(context),
      new ExpoNotificationsCategoriesSerializer()
    );
  }
}
