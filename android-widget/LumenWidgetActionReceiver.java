// MRCRISTIAN COPYRIGHT — widget deep-link dispatcher
package com.mrcristian.lumen;
import android.content.BroadcastReceiver;import android.content.Context;import android.content.Intent;
public class LumenWidgetActionReceiver extends BroadcastReceiver { @Override public void onReceive(Context c,Intent i){String a=i.getStringExtra("action");Intent launch=c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());if(launch!=null){launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK|Intent.FLAG_ACTIVITY_SINGLE_TOP);if("on".equals(a)||"off".equals(a))launch.setData(android.net.Uri.parse("lumen://action/"+a));c.startActivity(launch);}}}
