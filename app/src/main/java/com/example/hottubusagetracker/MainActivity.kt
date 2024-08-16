package com.example.hottubusagetracker

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Checkbox
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import com.example.hottubusagetracker.ui.theme.HotTubUsageTrackerTheme
import dev.convex.android.ConvexClient
import io.github.cdimascio.dotenv.dotenv
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val dotenv = dotenv {
            directory = "/assets"
            filename = "env"
        }
        val convex = ConvexClient(dotenv["CONVEX_URL"])
        setContent {
            HotTubUsageTrackerTheme {
                Scaffold(modifier = Modifier.fillMaxSize()) { innerPadding ->
                    Tasks(
                        client = convex,
                        modifier = Modifier.padding(innerPadding)
                    )
                }
            }
        }
    }
}

@Serializable
data class Task(val _id: String,val text: String, val isCompleted: Boolean)

@Composable
fun Tasks(client: ConvexClient, modifier: Modifier = Modifier) {
    var tasks: List<Task> by remember { mutableStateOf(listOf()) }
    val coroutineScope = rememberCoroutineScope() // Create a coroutine scope tied to the composition

    LaunchedEffect(key1 = "launch") {
        client.subscribe<List<Task>>("tasks:get").collect { result ->
            result.onSuccess { remoteTasks ->
                tasks = remoteTasks
            }
        }
    }
    LazyColumn(
        modifier = modifier
    ) {
        items(tasks) { task ->
            Row {
                Checkbox(checked = task.isCompleted, onCheckedChange = { checked ->
                    coroutineScope.launch {
                        client.mutation("tasks:setCompleted", mapOf("taskId" to task._id, "completed" to checked))
                    }
                })
                Text(text = task.text)
            }
        }
    }
}