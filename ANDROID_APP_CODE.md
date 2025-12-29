# CÓDIGO FUENTE DE APLICACIÓN NATIVA ANDROID (KOTLIN)

Copia estos archivos en tu proyecto de Android Studio para compilar la aplicación del operario.

---

## 1. AndroidManifest.xml
*Ubicación: app/src/main/AndroidManifest.xml*
Asegúrate de incluir los permisos de ubicación e Internet.

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.fleetlink.tracker">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Fleet Link Tracker"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.FleetLink">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".LocationService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="location" />
    </application>

</manifest>
```

---

## 2. LocationService.kt
*Ubicación: app/src/main/java/com/fleetlink/tracker/LocationService.kt*
Este servicio maneja el GPS en segundo plano y envía los datos al servidor (o simula el envío).

```kotlin
package com.fleetlink.tracker

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class LocationService : Service(), LocationListener {

    private lateinit var locationManager: LocationManager
    private val scope = CoroutineScope(Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
        startForegroundService()
        startTracking()
    }

    private fun startForegroundService() {
        val channelId = "fleet_tracking_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Fleet Tracking Service",
                NotificationManager.IMPORTANCE_LOW
            )
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Fleet Link Activo")
            .setContentText("Transmitiendo ubicación en tiempo real...")
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .build()

        startForeground(1, notification)
    }

    private fun startTracking() {
        try {
            // Request updates every 5 seconds or 10 meters
            locationManager.requestLocationUpdates(
                LocationManager.GPS_PROVIDER,
                5000L,
                10f,
                this
            )
        } catch (e: SecurityException) {
            Log.e("LocationService", "Permission error: ${e.message}")
        }
    }

    override fun onLocationChanged(location: Location) {
        val lat = location.latitude
        val lng = location.longitude
        val speed = location.speed * 3.6 // Convert m/s to km/h

        Log.d("FleetTracker", "New Location: $lat, $lng | Speed: $speed")

        // EN UN ENTORNO REAL: Aquí se enviarían los datos a tu API
        scope.launch {
            sendDataToServer(lat, lng, speed)
        }
    }

    private fun sendDataToServer(lat: Double, lng: Double, speed: Double) {
        // Simulación de llamada HTTP. 
        // En producción usa Retrofit o OkHttp para hacer POST a tu backend.
        // val json = "{\"lat\": $lat, \"lng\": $lng, \"speed\": $speed}"
        // api.postLocation(json)
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        locationManager.removeUpdates(this)
    }
}
```

---

## 3. MainActivity.kt
*Ubicación: app/src/main/java/com/fleetlink/tracker/MainActivity.kt*
Interfaz de usuario simple para el conductor.

```kotlin
package com.fleetlink.tracker

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 123
    private var isTracking = false
    private lateinit var statusText: TextView
    private lateinit var actionButton: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main) // Asume un XML simple con TextView y Button

        statusText = findViewById(R.id.statusText)
        actionButton = findViewById(R.id.actionButton)

        actionButton.setOnClickListener {
            if (!isTracking) {
                if (checkPermissions()) {
                    startService()
                } else {
                    requestPermissions()
                }
            } else {
                stopService()
            }
        }
    }

    private fun checkPermissions(): Boolean {
        return ContextCompat.checkSelfPermission(
            this, Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestPermissions() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION,
                Manifest.permission.POST_NOTIFICATIONS
            ),
            PERMISSION_REQUEST_CODE
        )
    }

    private fun startService() {
        val intent = Intent(this, LocationService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
        isTracking = true
        statusText.text = "ESTADO: TRANSMITIENDO"
        statusText.setTextColor(getColor(android.R.color.holo_green_light))
        actionButton.text = "DETENER RASTREO"
        actionButton.setBackgroundColor(getColor(android.R.color.holo_red_dark))
    }

    private fun stopService() {
        val intent = Intent(this, LocationService::class.java)
        stopService(intent)
        isTracking = false
        statusText.text = "ESTADO: INACTIVO"
        statusText.setTextColor(getColor(android.R.color.darker_gray))
        actionButton.text = "INICIAR RASTREO"
        actionButton.setBackgroundColor(getColor(android.R.color.holo_blue_dark))
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startService()
            } else {
                Toast.makeText(this, "Se requieren permisos de GPS", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
```

## 4. activity_main.xml (Layout Básico)
*Ubicación: app/src/main/res/layout/activity_main.xml*

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical"
    android:gravity="center"
    android:background="#000000"
    android:padding="24dp">

    <TextView
        android:text="FLEET LINK"
        android:textColor="#06b6d4"
        android:textSize="24sp"
        android:textStyle="bold"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="32dp"/>

    <TextView
        android:id="@+id/statusText"
        android:text="ESTADO: INACTIVO"
        android:textColor="#888888"
        android:textSize="18sp"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="48dp"/>

    <Button
        android:id="@+id/actionButton"
        android:text="INICIAR RASTREO"
        android:backgroundTint="#2563eb"
        android:textColor="#ffffff"
        android:padding="16dp"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"/>

</LinearLayout>
```