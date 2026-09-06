import { DexClassItem } from '../types';

export const SAMPLE_DECOMPILED_CLASSES: Record<string, DexClassItem[]> = {
  'org.civerappstore.app': [
    {
      className: 'org.civerappstore.core.SecurityVerifier',
      packageName: 'org.civerappstore.core',
      accessFlags: ['public', 'final'],
      superClass: 'java.lang.Object',
      interfaces: ['org.civerappstore.contracts.IVerifier'],
      fields: ['private static final String SHA256_PIN', 'private final SharedPreferences prefs'],
      methods: [
        {
          name: 'verifyApkSignature',
          signature: '(Ljava/io/File;Ljava/lang/String;)Z',
          accessFlags: ['public'],
          bytecodesCount: 42,
          smaliCode: `.method public verifyApkSignature(Ljava/io/File;Ljava/lang/String;)Z
    .registers 6
    .param p1, "apkFile"    # Ljava/io/File;
    .param p2, "expectedDigest"    # Ljava/lang/String;

    .prologue
    const/4 v0, 0x1
    invoke-static {p1}, Lorg/civerappstore/crypto/ApkSignerV4;->computeTreeDigest(Ljava/io/File;)Ljava/lang/String;
    move-result-object v1

    invoke-virtual {v1, p2}, Ljava/lang/String;->equalsIgnoreCase(Ljava/lang/String;)Z
    move-result v2

    if-eqz v2, :cond_0c
    return v0

    :cond_0c
    const/4 v0, 0x0
    return v0
.end method`
        },
        {
          name: 'auditExodusTrackers',
          signature: '(Landroid/content/pm/PackageInfo;)Ljava/util/List;',
          accessFlags: ['public', 'static'],
          bytecodesCount: 88,
          smaliCode: `.method public static auditExodusTrackers(Landroid/content/pm/PackageInfo;)Ljava/util/List;
    .registers 4
    .param p0, "pkg"    # Landroid/content/pm/PackageInfo;

    .prologue
    new-instance v0, Ljava/util/ArrayList;
    invoke-direct {v0}, Ljava/util/ArrayList;-><init>()V

    # Checking package DEX for known telemetry classes
    const-string v1, "com.google.android.gms.measurement"
    invoke-static {p0, v1}, Lorg/civerappstore/audit/TrackerScanner;->hasMatchingClass(Landroid/content/pm/PackageInfo;Ljava/lang/String;)Z
    move-result v2

    if-eqz v2, :cond_clean
    const-string v3, "Google Firebase Analytics (Telemetry)"
    invoke-virtual {v0, v3}, Ljava/util/ArrayList;->add(Ljava/lang/Object;)Z

    :cond_clean
    return-object v0
.end method`
        }
      ],
      smaliSource: `.class public final Lorg/civerappstore/core/SecurityVerifier;
.super Ljava/lang/Object;
.implements Lorg/civerappstore/contracts/IVerifier;`
    },
    {
      className: 'org.civerappstore.shizuku.ShizukuBinderClient',
      packageName: 'org.civerappstore.shizuku',
      accessFlags: ['public'],
      superClass: 'java.lang.Object',
      interfaces: ['rikka.shizuku.Shizuku.OnBinderReceivedListener'],
      fields: ['private IBinder binderService', 'private boolean isPrivileged'],
      methods: [
        {
          name: 'executeRootlessInstall',
          signature: '(Ljava/lang/String;Landroid/content/IntentSender;)I',
          accessFlags: ['public'],
          bytecodesCount: 65,
          smaliCode: `.method public executeRootlessInstall(Ljava/lang/String;Landroid/content/IntentSender;)I
    .registers 5
    .param p1, "apkPath"    # Ljava/lang/String;
    .param p2, "statusReceiver"    # Landroid/content/IntentSender;

    .prologue
    invoke-static {}, Lrikka/shizuku/Shizuku;->pingBinder()Z
    move-result v0
    if-nez v0, :cond_binder_dead

    # Create PackageInstaller Session with ADB privileged token
    invoke-static {p2}, Lorg/civerappstore/shizuku/SessionHelper;->createSession(Ljava/lang/String;)I
    move-result v1
    return v1

    :cond_binder_dead
    const/4 v2, -0x1
    return v2
.end method`
        }
      ],
      smaliSource: `.class public Lorg/civerappstore/shizuku/ShizukuBinderClient;
.super Ljava/lang/Object;
.implements Lrikka/shizuku/Shizuku$OnBinderReceivedListener;`
    }
  ]
};

// Aliases for backward compatibility
SAMPLE_DECOMPILED_CLASSES['org.ciberstore.app'] = SAMPLE_DECOMPILED_CLASSES['org.civerappstore.app'];

export const SAMPLE_ANDROID_MANIFEST_XML: Record<string, string> = {
  'org.civerappstore.app': `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="org.civerappstore.app"
    android:versionCode="600"
    android:versionName="6.0.0-PRO">

    <!-- Permissions Declarations -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="moe.shizuku.manager.permission.API_V23" />

    <!-- Application Node -->
    <application
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="Civer App Store"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.CiverAppStore"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".ui.MainActivity"
            android:exported="true"
            android:launchMode="singleTop">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
            
            <!-- Deep Linking for F-Droid and Matrix Repos -->
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="fdroidrepo" />
                <data android:scheme="civerrepo" />
            </intent-filter>
        </activity>

        <service
            android:name=".services.BackgroundSyncWorker"
            android:permission="android.permission.BIND_JOB_SERVICE"
            android:exported="false" />
    </application>
</manifest>`
};

SAMPLE_ANDROID_MANIFEST_XML['org.ciberstore.app'] = SAMPLE_ANDROID_MANIFEST_XML['org.civerappstore.app'];
