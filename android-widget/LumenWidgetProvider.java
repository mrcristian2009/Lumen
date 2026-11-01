// MRCRISTIAN COPYRIGHT — Lumen Android home-screen widget
package com.mrcristian.lumen;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;
public class LumenWidgetProvider extends AppWidgetProvider {
 @Override public void onUpdate(Context c, AppWidgetManager m, int[] ids) {
  for(int id:ids){ RemoteViews v=new RemoteViews(c.getPackageName(), R.layout.lumen_widget);
   v.setOnClickPendingIntent(R.id.widget_on, action(c,"on",id*10+1));
   v.setOnClickPendingIntent(R.id.widget_off, action(c,"off",id*10+2));
   v.setOnClickPendingIntent(R.id.widget_open, action(c,"open",id*10+3)); m.updateAppWidget(id,v); }
 }
 private PendingIntent action(Context c,String a,int request){ Intent i=new Intent(c,LumenWidgetActionReceiver.class);i.setAction("com.mrcristian.lumen."+a.toUpperCase());i.putExtra("action",a);return PendingIntent.getBroadcast(c,request,i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE); }
}
