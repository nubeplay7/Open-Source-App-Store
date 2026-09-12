' tools/run_background_task.vbs
' Lanzador Invisible de Río Subterráneo para Windows
' Ejecuta comandos desacoplados del IDE en segundo plano sin ventana (estilo oculto 0)

If WScript.Arguments.Count = 0 Then
    WScript.Quit 1
End If

Dim shell, cmd, i
Set shell = CreateObject("WScript.Shell")

cmd = ""
For i = 0 To WScript.Arguments.Count - 1
    If InStr(WScript.Arguments(i), " ") > 0 Then
        cmd = cmd & """" & WScript.Arguments(i) & """ "
    Else
        cmd = cmd & WScript.Arguments(i) & " "
    End If
Next

cmd = Trim(cmd)
shell.Run cmd, 0, False
Set shell = Nothing
